using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniCommerce.Api.Data;
using MiniCommerce.Api.Models;

namespace MiniCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<Category>>> GetAll()
    {
        return await _context.Categories
            .AsNoTracking()
            .ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Category>> GetById(int id)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category is null)
            return NotFound("Categoria não encontrada.");

        return category;
    }

    [HttpPost]
    public async Task<ActionResult<Category>> Create(Category category)
    {
        if (string.IsNullOrWhiteSpace(category.Name))
            return BadRequest("O nome da categoria é obrigatório.");

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Category category)
    {
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == id);

        if (!categoryExists)
            return NotFound("Categoria não encontrada.");

        category.Id = id;

        _context.Categories.Update(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category is null)
            return NotFound("Categoria não encontrada.");

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}