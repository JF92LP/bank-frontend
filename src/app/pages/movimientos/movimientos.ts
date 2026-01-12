import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './movimientos.html',
  styleUrls: ['./movimientos.css'],
})
export class MovimientosComponent implements OnInit {
  numeroCuenta = '';
  movimientos: any[] = [];

  cargando = false;
  errorMsg = '';
  okMsg = '';

  form: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.form = this.fb.group({
      tipoMovimiento: ['Credito', [Validators.required]],
      valor: [0, [Validators.required, Validators.min(0.01)]],
    });
  }

  ngOnInit(): void {}

  buscarMovimientos(): void {
    this.errorMsg = '';
    this.okMsg = '';
    this.movimientos = [];

    const cuenta = this.numeroCuenta.trim();
    if (!cuenta) {
      this.errorMsg = 'Ingresa un número de cuenta.';
      return;
    }

    this.cargando = true;
    this.api.getMovimientosPorCuenta(cuenta)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (data: any[]) => {
          this.movimientos = data ?? [];
        },
        error: (err: any) => {
          this.errorMsg = err?.error?.message || 'No se pudo cargar movimientos. Verifica el número de cuenta.';
        }
      });
  }

  procesarMovimiento(): void {
    this.errorMsg = '';
    this.okMsg = '';

    const cuenta = this.numeroCuenta.trim();
    if (!cuenta) {
      this.errorMsg = 'Ingresa un número de cuenta antes de procesar.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      numeroCuenta: cuenta,
      tipoMovimiento: this.form.value.tipoMovimiento,
      valor: Number(this.form.value.valor), // el backend transforma a delta
    };

    this.cargando = true;
    this.api.createMovimiento(payload)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (mov: any) => {
          this.okMsg = `Movimiento registrado. Saldo resultante: ${mov?.saldo ?? ''}`;
          this.form.patchValue({ valor: 0 });
          this.buscarMovimientos();
        },
        error: (err: any) => {
          this.errorMsg = err?.error?.message || 'No se pudo registrar el movimiento.';
        }
      });
  }
}
