import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { Cliente } from '../../models/cliente.model';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css'],
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];

  cargando = false;
  errorMsg = '';

  searchText = '';

  form: FormGroup;
  editandoClienteId: number | null = null;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      genero: ['', [Validators.required]],
      edad: [18, [Validators.required, Validators.min(1)]],
      identificacion: ['', [Validators.required, Validators.minLength(5)]],
      direccion: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.minLength(7)]],

      // IMPORTANTE:
      // - En CREAR: obligatorio
      // - En EDITAR: lo volvemos opcional (ver setPasswordRequired)
      contrasena: ['', [Validators.required, Validators.minLength(4)]],

      estado: [true, [Validators.required]],
    });
  }

  ngOnInit(): void {
    console.log('[Clientes] ngOnInit DISPARADO');
    this.iniciarNuevo(); // deja el form en modo "crear" por defecto
    this.cargarClientes();
  }

  // =========================
  // Helpers de validación
  // =========================

  private setPasswordRequired(required: boolean): void {
    const ctrl = this.form.get('contrasena');
    if (!ctrl) return;

    if (required) {
      ctrl.setValidators([Validators.required, Validators.minLength(4)]);
    } else {
      // En edición: opcional (solo si el usuario quiere cambiarla)
      ctrl.clearValidators();
    }

    ctrl.updateValueAndValidity();
  }

  private normalizarEstado(payload: any): void {
    // Si el HTML envía "true"/"false" como string, lo convertimos a boolean
    if (typeof payload.estado === 'string') {
      payload.estado = payload.estado === 'true';
    }
  }

  private construirPayload(): any {
    const payload: any = { ...this.form.value };

    this.normalizarEstado(payload);

    // Si estamos editando y contrasena está vacía, NO la enviamos
    if (this.editandoClienteId !== null && (!payload.contrasena || String(payload.contrasena).trim() === '')) {
      delete payload.contrasena;
    }

    return payload;
  }

  // =========================
  // Cargar / filtrar
  // =========================

  cargarClientes(): void {
    console.log('[Clientes] cargarClientes() INICIO');
    this.errorMsg = '';
    this.cargando = true;

    this.api.getClientes()
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (data: Cliente[]) => {
          this.clientes = data ?? [];
          this.aplicarFiltro();
        },
        error: (err) => {
          console.error('Error GET /clientes', err);
          this.errorMsg = err?.error?.message || `Error ${err?.status || ''}: No se pudo cargar clientes.`;
        }
      });
  }

  aplicarFiltro(): void {
    const q = this.searchText.trim().toLowerCase();
    if (!q) {
      this.clientesFiltrados = [...this.clientes];
      return;
    }

    this.clientesFiltrados = this.clientes.filter((c) =>
      (c.nombre ?? '').toLowerCase().includes(q) ||
      (c.identificacion ?? '').toLowerCase().includes(q) ||
      (c.telefono ?? '').toLowerCase().includes(q)
    );
  }

  // =========================
  // UI actions
  // =========================

  iniciarNuevo(): void {
    this.editandoClienteId = null;

    // En modo crear: contraseña obligatoria
    this.setPasswordRequired(true);

    this.form.reset({
      nombre: '',
      genero: '',
      edad: 18,
      identificacion: '',
      direccion: '',
      telefono: '',
      contrasena: '',
      estado: true
    });
  }

  editar(cliente: Cliente): void {
    this.editandoClienteId = cliente.clienteId;

    // En modo editar: contraseña opcional (backend no la devuelve)
    this.setPasswordRequired(false);

    // OJO: No usamos patchValue(cliente) directo porque cliente ya NO trae contrasena
    // y porque queremos controlar el mapping
    this.form.patchValue({
      nombre: cliente.nombre ?? '',
      genero: cliente.genero ?? '',
      edad: cliente.edad ?? 18,
      identificacion: cliente.identificacion ?? '',
      direccion: cliente.direccion ?? '',
      telefono: cliente.telefono ?? '',
      contrasena: '', // Se deja vacía. Solo si desea cambiarla.
      estado: cliente.estado ?? true
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  guardar(): void {
    this.errorMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.construirPayload();

    // ====== CREAR ======
    if (this.editandoClienteId === null) {
      this.cargando = true;

      this.api.createCliente(payload)
        .pipe(finalize(() => (this.cargando = false)))
        .subscribe({
          next: () => {
            this.iniciarNuevo();
            this.cargarClientes();
          },
          error: (err) => {
            console.error('Error POST /clientes', err);
            this.errorMsg =
              err?.error?.message ||
              `Error ${err?.status || ''}: No se pudo crear el cliente.`;
          }
        });

      return;
    }

    // ====== EDITAR ======
    this.cargando = true;

    this.api.updateCliente(this.editandoClienteId, payload)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: () => {
          this.iniciarNuevo();
          this.cargarClientes();
        },
        error: (err) => {
          console.error('Error PUT /clientes/{id}', err);
          this.errorMsg =
            err?.error?.message ||
            `Error ${err?.status || ''}: No se pudo actualizar el cliente.`;
        }
      });
  }

  eliminar(cliente: Cliente): void {
    const ok = confirm(`¿Eliminar al cliente "${cliente.nombre}"?`);
    if (!ok) return;

    this.cargando = true;

    this.api.deleteCliente(cliente.clienteId)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: () => this.cargarClientes(),
        error: (err) => {
          console.error('Error DELETE /clientes/{id}', err);
          this.errorMsg =
            err?.error?.message ||
            `Error ${err?.status || ''}: No se pudo eliminar el cliente.`;
        }
      });
  }
}
