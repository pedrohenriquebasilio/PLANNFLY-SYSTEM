import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CpfValidationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value) {
      throw new BadRequestException('CPF é obrigatório');
    }

    // Remove caracteres não numéricos
    const cleanCpf = value.replace(/\D/g, '');

    if (cleanCpf.length !== 11) {
      throw new BadRequestException('CPF deve conter 11 dígitos');
    }

    if (this.allDigitsEqual(cleanCpf)) {
      throw new BadRequestException('CPF inválido');
    }

    if (!this.isValidCpf(cleanCpf)) {
      throw new BadRequestException('CPF inválido');
    }

    return cleanCpf;
  }

  private allDigitsEqual(cpf: string): boolean {
    return cpf.split('').every((digit) => digit === cpf[0]);
  }

  private isValidCpf(cpf: string): boolean {
    let sum = 0;
    let remainder: number;

    // Verifica primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    // Verifica segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }
}