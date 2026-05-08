using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MiniCommerce.Api.Models;

namespace MiniCommerce.Api.DTOs
{
    public class OrderResponseDto
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; }
        public List<OrderItemResponseDto> Items { get; set; } = [];
    }
}