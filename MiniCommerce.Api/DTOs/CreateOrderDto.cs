using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MiniCommerce.Api.DTOs
{
    public class CreateOrderDto
    {
        public List<CreateOrderItemDto> Items { get; set; } = [];
    }
}