using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniCommerce.Api.Data;
using MiniCommerce.Api.DTOs;
using MiniCommerce.Api.Models;
using Microsoft.AspNetCore.Authorization;

namespace MiniCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]

public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderResponseDto>>> GetAll()
    {
       var orders = await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .AsNoTracking()
            .ToListAsync();

        return orders.Select(ToResponseDto).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderResponseDto>> GetById(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null)
            return NotFound("Pedido não encontrado.");

        return ToResponseDto(order);
            
    }

    [HttpPost]
    public async Task<ActionResult<Order>> Create(CreateOrderDto dto)
    {
        if (dto.Items.Count == 0)
            return BadRequest("O pedido precisa ter pelo menos um item.");

        var order = new Order();

        foreach (var itemDto in dto.Items)
        {
            if (itemDto.Quantity <= 0)
                return BadRequest("A quantidade deve ser maior que zero.");

            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == itemDto.ProductId);

            if (product is null)
                return BadRequest($"Produto {itemDto.ProductId} não encontrado.");

            if (!product.IsActive)
                return BadRequest($"Produto {product.Name} está inativo.");

            if (product.StockQuantity < itemDto.Quantity)
                return BadRequest($"Estoque insuficiente para o produto {product.Name}.");

            product.StockQuantity -= itemDto.Quantity;

            var orderItem = new OrderItem
            {
                ProductId = product.Id,
                Quantity = itemDto.Quantity,
                UnitPrice = product.Price
            };

            order.Items.Add(orderItem);
            order.TotalAmount += product.Price * itemDto.Quantity;
        }

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var createdOrder = await _context.Orders
        .Include(o => o.Items)
            .ThenInclude(i => i.Product)
        .AsNoTracking()
        .FirstAsync(o => o.Id == order.Id);

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, ToResponseDto(createdOrder));
    }

    [HttpPatch("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null)
            return NotFound("Pedido não encontrado.");

        if (order.Status == OrderStatus.Canceled)
            return BadRequest("Pedido já está cancelado.");

        foreach (var item in order.Items)
        {
            var product = await _context.Products.FindAsync(item.ProductId);

            if (product is not null)
                product.StockQuantity += item.Quantity;
        }

        order.Status = OrderStatus.Canceled;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static OrderResponseDto ToResponseDto(Order order)
    {
        return new OrderResponseDto
        {
            Id = order.Id,
            CreatedAt = order.CreatedAt,
            TotalAmount = order.TotalAmount,    
            Status = order.Status,
            Items = order.Items.Select(i => new OrderItemResponseDto
            {
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? "Produto removido",
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                Subtotal = i.Quantity * i.UnitPrice
            }).ToList()
        };
    }

}