using Microsoft.EntityFrameworkCore;
using MiniCommerce.Api.Data;
using MiniCommerce.Api.Models;

namespace MiniCommerce.Api.Services;

public class CategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Category> CreateCategoryAsync(Category category)
    {
        ValidateCategory(category);

        var categoryExists = await _context.Categories
            .AnyAsync(c => c.Name.ToLower() == category.Name.ToLower());

        if (categoryExists)
            throw new InvalidOperationException("Já existe uma categoria com esse nome.");

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return category;
    }

    public async Task UpdateCategoryAsync(int id, Category updatedCategory)
    {
        ValidateCategory(updatedCategory);

        var category = await _context.Categories.FindAsync(id);

        if (category is null)
            throw new KeyNotFoundException("Categoria não encontrada.");

        var categoryNameExists = await _context.Categories
            .AnyAsync(c => c.Id != id && c.Name.ToLower() == updatedCategory.Name.ToLower());

        if (categoryNameExists)
            throw new InvalidOperationException("Já existe uma categoria com esse nome.");

        category.Name = updatedCategory.Name;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);

        if (category is null)
            throw new KeyNotFoundException("Categoria não encontrada.");

        var hasProducts = await _context.Products
            .AnyAsync(p => p.CategoryId == id);

        if (hasProducts)
            throw new InvalidOperationException("Não é possível excluir uma categoria que possui produtos vinculados.");

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }

    private static void ValidateCategory(Category category)
    {
        if (string.IsNullOrWhiteSpace(category.Name))
            throw new InvalidOperationException("O nome da categoria é obrigatório.");
    }
}