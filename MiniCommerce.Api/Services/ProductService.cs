using Microsoft.EntityFrameworkCore;
using MiniCommerce.Api.Data;
using MiniCommerce.Api.DTOs;
using MiniCommerce.Api.Models;

namespace MiniCommerce.Api.Services;

public class ProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Product> CreateProductAsync(CreateProductDto dto)
    {
        await ValidateProductAsync(dto);

        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            CategoryId = dto.CategoryId,
            IsActive = true
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return product;
    }

    public async Task UpdateProductAsync(int id, CreateProductDto dto)
    {
        var product = await _context.Products.FindAsync(id);

        if (product is null)
            throw new KeyNotFoundException("Produto não encontrado.");

        await ValidateProductAsync(dto);

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.StockQuantity = dto.StockQuantity;
        product.CategoryId = dto.CategoryId;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product is null)
            throw new KeyNotFoundException("Produto não encontrado.");

        product.IsActive = false;

        await _context.SaveChangesAsync();
    }

    private async Task ValidateProductAsync(CreateProductDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            throw new InvalidOperationException("O nome do produto é obrigatório.");

        if (dto.Price <= 0)
            throw new InvalidOperationException("Preço deve ser maior que zero.");

        if (dto.StockQuantity < 0)
            throw new InvalidOperationException("Estoque não pode ser negativo.");

        var categoryExists = await _context.Categories
            .AnyAsync(c => c.Id == dto.CategoryId);

        if (!categoryExists)
            throw new InvalidOperationException("Categoria inválida.");
    }
}