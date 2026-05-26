using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniCommerce.Api.Data;
using MiniCommerce.Api.Models;
using MiniCommerce.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using MiniCommerce.Api.Services;

namespace MiniCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]

public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ProductService _productService;
    

    public ProductsController(AppDbContext context, ProductService productService)
    {
        _context = context;
        _productService = productService;
    }
    
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductResponseDto>> Create(CreateProductDto dto)
    {
        var product = await _productService.CreateProductAsync(dto);

        var createdProduct = await _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .FirstAsync(p => p.Id == product.Id);

        return CreatedAtAction(
            nameof(GetById),
            new { id = product.Id },
            ToResponseDto(createdProduct)
        );
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
    [Authorize]
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
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, CreateProductDto dto)
    {

        await _productService.UpdateProductAsync(id, dto);
        return NoContent();
     
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        
        await _productService.DeleteProductAsync(id);
        return NoContent();
    }



    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<ProductResponseDto>>> GetAll()
    {
        var products = await _context.Products
            .Where(p => p.IsActive)
            .Include(p => p.Category)
            .AsNoTracking()
            .ToListAsync();

        return products.Select(ToResponseDto).ToList();
    }

    
}