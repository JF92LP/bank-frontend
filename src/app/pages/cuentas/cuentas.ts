import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ApiService } from '../../core/services/api.service';
import { Cuenta } from '../../models/cuenta.model';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-cuentas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cuentas.html',
  styleUrls: ['./cuentas.css'],
})
export class CuentasComponent implements OnInit {
  // Clientes
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  searchCliente = '';
  clienteSeleccionado: Cliente | null = null;

  // Cuentas
  clienteId: number | null = null;
  cuentas: Cuenta[] = [];
  cuentasFiltradas: Cuenta[] = [];
  searchText = '';

  cargando = false;
  errorMsg = '';

  form: FormGroup;
  editandoCuentaId: number | null = null;

  constructor(private api: ApiService, private fb: FormBuilder) {
    // NumeroCuenta ya NO se captura; backend lo genera
    this.form = this.fb.group({
      tipoCuenta: ['', [Validators.required]],
      saldoInicial: [0, [Validators.required, Validators.min(0)]],
      estado: [true, [Validators.required]],
    });
  }

  ngOnInit() {
    this.cargarClientes();
  }

  // =========================
  // CLIENTES
  // =========================
  cargarClientes() {
    this.errorMsg = '';
    this.cargando = true;

    this.api.getClientes().subscribe({
      next: (data: Cliente[]) => {
        this.clientes = data ?? [];
        this.filtrarClientes();
        this.cargando = false;
      },
      error: (err: any) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudo cargar clientes.';
      }
    });
  }

  filtrarClientes() {
    const q = this.searchCliente.trim().toLowerCase();
    if (!q) {
      this.clientesFiltrados = [...this.clientes];
      return;
    }

    this.clientesFiltrados = this.clientes.filter(c =>
      (c.nombre ?? '').toLowerCase().includes(q) ||
      (c.identificacion ?? '').toLowerCase().includes(q)
    );
  }

  seleccionarClientePorId(clienteIdStr: string) {
    const id = Number(clienteIdStr);
    if (!id) {
      this.clienteSeleccionado = null;
      this.clienteId = null;
      this.cuentas = [];
      this.cuentasFiltradas = [];
      return;
    }

    const c = this.clientes.find(x => x.clienteId === id) || null;
    this.seleccionarCliente(c);
  }

  private seleccionarCliente(c: Cliente | null) {
    this.clienteSeleccionado = c;

    if (!c) {
      this.clienteId = null;
      this.cuentas = [];
      this.cuentasFiltradas = [];
      return;
    }

    this.clienteId = c.clienteId;
    this.iniciarNueva();
    this.cargarCuentas();
  }

  // =========================
  // CUENTAS
  // =========================
  cargarCuentas() {
    this.errorMsg = '';

    if (!this.clienteId) {
      this.cuentas = [];
      this.cuentasFiltradas = [];
      this.errorMsg = 'Selecciona un cliente para ver sus cuentas.';
      return;
    }

    this.cargando = true;

    this.api.getCuentasPorCliente(this.clienteId).subscribe({
      next: (data: Cuenta[]) => {
        this.cuentas = data ?? [];
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: (err: any) => {
        this.errorMsg = err?.error?.message || 'No se pudo cargar cuentas.';
        this.cargando = false;
      }
    });
  }

  aplicarFiltro() {
    const q = this.searchText.trim().toLowerCase();
    if (!q) {
      this.cuentasFiltradas = [...this.cuentas];
      return;
    }
    this.cuentasFiltradas = this.cuentas.filter(c =>
      (c.numeroCuenta ?? '').toLowerCase().includes(q) ||
      (c.tipoCuenta ?? '').toLowerCase().includes(q)
    );
  }

  iniciarNueva() {
    this.editandoCuentaId = null;
    this.form.reset({
      tipoCuenta: '',
      saldoInicial: 0,
      estado: true
    });
  }

  editar(cuenta: Cuenta) {
    this.editandoCuentaId = cuenta.cuentaId;
    this.form.patchValue({
      tipoCuenta: cuenta.tipoCuenta,
      saldoInicial: cuenta.saldoInicial,
      estado: cuenta.estado
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  guardar() {
    this.errorMsg = '';

    if (!this.clienteId) {
      this.errorMsg = 'Selecciona un cliente antes de crear una cuenta.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;

    // Crear
    if (this.editandoCuentaId === null) {
      this.api.createCuenta(this.clienteId, payload).subscribe({
        next: () => {
          this.iniciarNueva();
          this.cargarCuentas();
        },
        error: (err: any) => {
          this.errorMsg = err?.error?.message || 'No se pudo crear la cuenta.';
        }
      });
      return;
    }

    // Editar
    this.api.updateCuenta(this.editandoCuentaId, payload).subscribe({
      next: () => {
        this.iniciarNueva();
        this.cargarCuentas();
      },
      error: (err: any) => {
        this.errorMsg = err?.error?.message || 'No se pudo actualizar la cuenta.';
      }
    });
  }

  eliminar(cuenta: Cuenta) {
    const ok = confirm(`¿Eliminar la cuenta "${cuenta.numeroCuenta}"?`);
    if (!ok) return;

    this.api.deleteCuenta(cuenta.cuentaId).subscribe({
      next: () => this.cargarCuentas(),
      error: (err: any) => {
        this.errorMsg = err?.error?.message || 'No se pudo eliminar la cuenta.';
      }
    });
  }
}
