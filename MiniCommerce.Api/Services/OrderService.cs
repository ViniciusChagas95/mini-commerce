using Microsoft.EntityFrameworkCore;
using MiniCommerce.Api.Data;
using MiniCommerce.Api.DTOs;
using MiniCommerce.Api.Models;

namespace MiniCommerce.Api.Services;

public class OrderService
{
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Order> CreateOrderAsync(CreateOrderDto dto)
    {
        if (dto.Items.Count == 0)
            throw new InvalidOperationException("O pedido precisa ter pelo menos um item.");

        var order = new Order();

        foreach (var itemDto in dto.Items)
        {
            if (itemDto.Quantity <= 0)
                throw new InvalidOperationException("A quantidade deve ser maior que zero.");

            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == itemDto.ProductId);

            if (product is null)
                throw new InvalidOperationException($"Produto {itemDto.ProductId} não encontrado.");

            if (!product.IsActive)
                throw new InvalidOperationException($"Produto {product.Name} está inativo.");

            if (product.StockQuantity < itemDto.Quantity)
                throw new InvalidOperationException($"Estoque insuficiente para o produto {product.Name}.");

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

        return order;
    }
    public async Task PayOrderAsync(int orderId)
{
    var order = await _context.Orders.FindAsync(orderId);

    if (order is null)
        throw new KeyNotFoundException("Pedido não encontrado.");

    if (order.Status == OrderStatus.Canceled)
        throw new InvalidOperationException("Não é possível pagar um pedido cancelado.");

    if (order.Status == OrderStatus.Paid)
        throw new InvalidOperationException("Pedido já está pago.");

    order.Status = OrderStatus.Paid;

    await _context.SaveChangesAsync();
}

    public async Task CancelOrderAsync(int orderId)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order is null)
            throw new KeyNotFoundException("Pedido não encontrado.");

        if (order.Status == OrderStatus.Canceled)
            throw new InvalidOperationException("Pedido já está cancelado.");

        if (order.Status == OrderStatus.Paid)
            throw new InvalidOperationException("Não é possível cancelar um pedido já pago.");
        foreach (var item in order.Items)
        {
            var product = await _context.Products.FindAsync(item.ProductId);

            if (product is not null)
                product.StockQuantity += item.Quantity;
        }

        order.Status = OrderStatus.Canceled;

        await _context.SaveChangesAsync();
    }
}