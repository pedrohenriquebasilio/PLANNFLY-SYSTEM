import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsCpf(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCpf',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          // Remove caracteres não numéricos
          const cleanCpf = value.replace(/\D/g, '');

          if (cleanCpf.length !== 11) return false;

          // Verifica se todos os dígitos são iguais
          if (cleanCpf.split('').every((digit) => digit === cleanCpf[0])) {
            return false;
          }

          // Valida primeiro dígito verificador
          let sum = 0;
          for (let i = 1; i <= 9; i++) {
            sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
          }
          let remainder = (sum * 10) % 11;
          if (remainder === 10 || remainder === 11) remainder = 0;
          if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;

          // Valida segundo dígito verificador
          sum = 0;
          for (let i = 1; i <= 10; i++) {
            sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
          }
          remainder = (sum * 10) % 11;
          if (remainder === 10 || remainder === 11) remainder = 0;
          if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'CPF inválido';
        },
      },
    });
  };
}