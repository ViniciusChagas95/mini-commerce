using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MiniCommerce.Api.Models;

namespace MiniCommerce.Api.DTOs
{
    public class RegisterDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Employee;
    }
}