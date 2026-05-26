using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MiniCommerce.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace MiniCommerce.Api.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        public string Name { get; set; } = string.Empty;
        [Required(ErrorMessage = "O email é obrigatório.")]
        [EmailAddress(ErrorMessage = "O email não é válido.")]
        public string Email { get; set; } = string.Empty;
        [Required(ErrorMessage = "A senha é obrigatória.")]
        [MinLength(6, ErrorMessage = "A senha deve ter pelo menos 6 caracteres.")]
        public string Password { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Employee;
    }
}