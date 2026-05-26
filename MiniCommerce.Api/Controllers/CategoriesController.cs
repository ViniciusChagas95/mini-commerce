using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniCommerce.Api.Data;
using MiniCommerce.Api.Models;
using Microsoft.AspNetCore.Authorization;
using MiniCommerce.Api.Services;

namespace MiniCommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly CategoryService _categoryService;

    public CategoriesController(AppDbContext context, CategoryService categoryService)
    {
        _context = context;
        _categoryService = categoryService;
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
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Category>> Create(Category category)
    {
      
            var createdCategory = await _categoryService.CreateCategoryAsync(category);

            return CreatedAtAction(
                nameof(GetById),
                new { id = createdCategory.Id },
                createdCategory
            );
      
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, Category category)
    {
       
            await _categoryService.UpdateCategoryAsync(id, category);
            return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
       
            await _categoryService.DeleteCategoryAsync(id);
            return NoContent();
    }
}
