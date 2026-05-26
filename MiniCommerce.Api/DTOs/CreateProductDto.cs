using System.ComponentModel.DataAnnotations;
namespace MiniCommerce.Api.DTOs;

public class CreateProductDto
{
    [Required(ErrorMessage = "O nome do produto é obrigatório.")]
    public string Name { get; set; } = string.Empty;
    [Required(ErrorMessage = "A descrição do produto é obrigatória.")]
    public string Description { get; set; } = string.Empty;
    [Range(0.01, double.MaxValue, ErrorMessage = "O preço do produto deve ser maior que zero.")]
    public decimal Price { get; set; }
    [Range(0, int.MaxValue, ErrorMessage = "O estoque não pode ser negativo.")]
    public int StockQuantity { get; set; }
    [Range(1, int.MaxValue, ErrorMessage = "A categoria é obrigatória.")]
    public int CategoryId { get; set; }
}