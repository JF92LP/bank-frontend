import { Cliente } from './cliente.model';

export interface Cuenta {
  cuentaId: number;
  numeroCuenta: string;
  tipoCuenta: string; // "Ahorros" | "Corriente"
  saldoInicial: number;
  saldoActual: number;
  estado: boolean;
  cliente?: Cliente; // a veces el backend lo manda
}
