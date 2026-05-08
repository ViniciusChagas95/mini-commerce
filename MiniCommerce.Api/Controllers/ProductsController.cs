using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniCommerce.Api.Data;
using MiniCommerce.Api.Models;
using MiniCommerce.Api.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace MiniCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]

public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductResponseDto>>> GetAll()
    {
        var products = await _context.Products
            .Where(p => p.IsActive).Where(p => p.StockQuantity > 0)
            .Include(p => p.Category)
            .AsNoTracking()
            .ToListAsync();

        return products.Select(ToResponseDto).ToList();
    }

    [HttpPost]
    public async Task<ActionResult<Product>> Create(CreateProductDto dto)
    {
        var categoryExists = await _context.Categories
            .AnyAsync(c => c.Id == dto.CategoryId);

        if (!categoryExists)
            return BadRequest("Categoria inválida.");

        if (dto.Price <= 0)
            return BadRequest("Preço deve ser maior que zero.");

        if (dto.StockQuantity < 0)
            return BadRequest("Estoque não pode ser negativo.");

        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            CategoryId = dto.CategoryId
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

    var createdProduct = await _context.Products
        .Include(p => p.Category)
        .AsNoTracking()
        .FirstAsync(p => p.Id == product.Id);

    return CreatedAtAction(nameof(GetById), new { id = product.Id }, ToResponseDto(createdProduct));
    }
    private static ProductResponseDto ToResponseDto(Product product)
    {
        return new ProductResponseDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            IsActive = product.IsActive,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty
        };
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResponseDto>> GetById(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product is null)
            return NotFound("Produto não encontrado.");

        return ToResponseDto(product);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CreateProductDto dto)
    {
        var product = await _context.Products.FindAsync(id);

        if (product is null)
            return NotFound("Produto não encontrado.");

        var categoryExists = await _context.Categories
            .AnyAsync(c => c.Id == dto.CategoryId);

        if (!categoryExists)
            return BadRequest("Categoria inválida.");

        if (dto.Price <= 0)
            return BadRequest("Preço deve ser maior que zero.");

        if (dto.StockQuantity < 0)
            return BadRequest("Estoque não pode ser negativo.");

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.StockQuantity = dto.StockQuantity;
        product.CategoryId = dto.CategoryId;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product is null)
            return NotFound("Produto não encontrado.");

        product.IsActive = false;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    
}