using System.ComponentModel.DataAnnotations;
namespace MiniCommerce.Api.DTOs
{
    public class CreateOrderItemDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Produto inválido.")]
        public int ProductId { get; set; }
        [Range(1, int.MaxValue, ErrorMessage = "A quantidade deve ser maior que zero.")]
        public int Quantity { get; set; }
    }
}