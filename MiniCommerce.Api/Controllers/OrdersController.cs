using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniCommerce.Api.Data;
using MiniCommerce.Api.DTOs;
using MiniCommerce.Api.Models;
using Microsoft.AspNetCore.Authorization;
using MiniCommerce.Api.Services;

namespace MiniCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]

public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly OrderService _orderService;

   public OrdersController(AppDbContext context, OrderService orderService)
    {
        _context = context;
        _orderService = orderService;
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
    
    [HttpGet("active")]
    public async Task<ActionResult<List<OrderResponseDto>>> GetActive()
    {
        var orders = await _context.Orders
            .Where(o => o.Status != OrderStatus.Canceled)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .AsNoTracking()
            .ToListAsync();

        return orders.Select(ToResponseDto).ToList();
    }

    [HttpGet("canceled")]
    public async Task<ActionResult<List<OrderResponseDto>>> GetCanceled()
    {
        var orders = await _context.Orders
            .Where(o => o.Status == OrderStatus.Canceled)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .AsNoTracking()
            .ToListAsync();

        return orders.Select(ToResponseDto).ToList();
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponseDto>> Create(CreateOrderDto dto)
    {
        
            var order = await _orderService.CreateOrderAsync(dto);

            var createdOrder = await _context.Orders
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .AsNoTracking()
                .FirstAsync(o => o.Id == order.Id);

            return CreatedAtAction(
                nameof(GetById),
                new { id = order.Id },
                ToResponseDto(createdOrder)
            );
       
    }
    
    [HttpPatch("{id:int}/pay")]
    public async Task<IActionResult> Pay(int id)
    {
        
            await _orderService.PayOrderAsync(id);
            return NoContent();
        
    }

    [HttpPatch("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        
            await _orderService.CancelOrderAsync(id);
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