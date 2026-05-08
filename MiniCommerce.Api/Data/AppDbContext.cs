using Microsoft.EntityFrameworkCore;
using MiniCommerce.Api.Models;

namespace MiniCommerce.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories => Set <Category>();
    public DbSet<Product> Products => Set <Product>();
    public DbSet<Order> Orders => Set <Order>();
    public DbSet<OrderItem> OrderItems => Set <OrderItem>();
    public DbSet<User> Users => Set<User>();
    
    
}
