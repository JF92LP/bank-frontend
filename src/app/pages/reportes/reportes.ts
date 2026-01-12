import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Cliente } from '../../models/cliente.model';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

type MovimientoItem = {
  fecha: string;
  tipoMovimiento: string;
  valor: number;
  saldo: number;
};

type ReporteEstadoCuenta = {
  numeroCuenta: string;
  cliente: string;
  saldoActual: number;
  movimientos: MovimientoItem[];
  pdfBase64?: string;
};

type CuentaItem = {
  cuentaId?: number;
  numeroCuenta: string;
  tipoCuenta?: string;
  saldoInicial?: number;
  saldoActual?: number;
  estado?: boolean;
};

type MovimientoClienteItem = {
  fecha: string;
  cliente: string;
  numeroCuenta: string;
  tipo: string;
  saldoInicial: number;
  estado: boolean;
  movimiento: number;
  saldoDisponible: number;
};

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class ReportesComponent implements OnInit {
  // UI
  modoBusqueda: 'cuenta' | 'cliente' = 'cuenta';
  cargando = false;

  /* =========================
     MODO 1: POR CUENTA
     ========================= */
  numeroCuenta = '478758';
  fechaInicio = '2026-01-10';
  fechaFin = '2026-01-10';

  reporte: ReporteEstadoCuenta | null = null;
  errorMsg = '';

  /* =========================
     MODO 2: POR CLIENTE
     ========================= */
  clientes: Cliente[] = [];
  clienteIdSeleccionado: number | null = null;

  fechaInicioCliente = '2026-01-10';
  fechaFinCliente = '2026-01-10';

  cuentasCliente: CuentaItem[] = [];
  movimientosCliente: MovimientoClienteItem[] = [];

  errorMsgCliente = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Cargar clientes automáticamente para que el dropdown siempre funcione
    this.cargarClientesAuto();

    // (Opcional) sincronizar fechas al iniciar
    this.fechaInicioCliente = this.fechaInicio;
    this.fechaFinCliente = this.fechaFin;
  }

  /* =========================
     CAMBIO DE MODO (opcional)
     ========================= */
  onCambiarModo(): void {
    // Limpia mensajes/estado al cambiar entre modos
    this.errorMsg = '';
    this.errorMsgCliente = '';

    if (this.modoBusqueda === 'cuenta') {
      // no tocamos reporte por cuenta
      return;
    }

    // al entrar a modo cliente, limpiar data anterior
    this.clienteIdSeleccionado = null;
    this.cuentasCliente = [];
    this.movimientosCliente = [];
  }

  /* =========================
     MODO 1: POR CUENTA (OK)
     ========================= */
  consultar(): void {
    this.errorMsg = '';
    this.cargando = true;
    this.reporte = null;

    this.api.getReporteEstadoCuenta(this.numeroCuenta, this.fechaInicio, this.fechaFin).subscribe({
      next: (data: ReporteEstadoCuenta) => {
        if (data) data.movimientos = data.movimientos ?? [];
        this.reporte = data ?? null;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo generar el reporte.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get puedeDescargar(): boolean {
    return (this.reporte?.movimientos ?? []).length > 0;
  }

  descargarPdf(): void {
    if (!this.puedeDescargar) return;

    this.errorMsg = '';
    this.cargando = true;

    this.api.getReporteEstadoCuentaPdf(this.numeroCuenta, this.fechaInicio, this.fechaFin).subscribe({
      next: (data: ReporteEstadoCuenta | any) => {
        const base64 = data?.pdfBase64;
        if (!base64) {
          // Si el backend decidió no generar PDF (p.ej. no hay movimientos)
          this.errorMsg = 'No hay movimientos en el rango seleccionado para generar el PDF.';
          this.cargando = false;
          this.cdr.detectChanges();
          return;
        }

        const filename = `estado_cuenta_${this.numeroCuenta}_${this.fechaInicio}_a_${this.fechaFin}.pdf`;
        this.descargarBase64Pdf(base64, filename);

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo descargar el PDF.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  /* =========================
     MODO 2: POR CLIENTE
     ========================= */
  private cargarClientesAuto(): void {
    this.errorMsgCliente = '';
    this.cargando = true;

    this.api.getClientes()
      .pipe(
        catchError((err) => {
          this.errorMsgCliente = err?.error?.message || 'No se pudieron cargar los clientes.';
          return of([]);
        }),
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe((data: Cliente[] | any) => {
        this.clientes = Array.isArray(data) ? data : [];
      });
  }

  cargarDataCliente(): void {
    this.errorMsgCliente = '';
    this.cuentasCliente = [];
    this.movimientosCliente = [];

    if (!this.clienteIdSeleccionado) {
      this.errorMsgCliente = 'Seleccione un cliente.';
      return;
    }

    this.cargando = true;

    const clienteId = this.clienteIdSeleccionado;
    const ini = this.fechaInicioCliente;
    const fin = this.fechaFinCliente;

    forkJoin({
      cuentas: this.api.getCuentasPorCliente(clienteId).pipe(catchError(() => of([]))),
      movimientos: this.api.getMovimientosPorCliente(clienteId, ini, fin).pipe(catchError(() => of([]))),
    })
    .pipe(finalize(() => {
      this.cargando = false;
      this.cdr.detectChanges();
    }))
    .subscribe(({ cuentas, movimientos }: any) => {
      this.cuentasCliente = Array.isArray(cuentas) ? cuentas : [];
      this.movimientosCliente = Array.isArray(movimientos) ? movimientos : [];

      // Si no hay cuentas, el HTML muestra “no tiene cuentas”
      // Si no hay movimientos, el HTML debe mostrar “No hay movimientos…”
    });
  }

  // ✅ Descargar PDF cliente SOLO si hay movimientos en el rango
  get puedeDescargarCliente(): boolean {
    return !!this.clienteIdSeleccionado && (this.movimientosCliente?.length ?? 0) > 0;
  }

  descargarPdfCliente(): void {
    if (!this.clienteIdSeleccionado) {
      this.errorMsgCliente = 'Seleccione un cliente.';
      return;
    }

    // Doble protección (aunque el botón ya se oculta si no hay movimientos)
    if ((this.movimientosCliente?.length ?? 0) === 0) {
      this.errorMsgCliente = 'No hay movimientos en el rango seleccionado para generar el PDF.';
      return;
    }

    this.errorMsgCliente = '';
    this.cargando = true;

    const clienteId = this.clienteIdSeleccionado;
    const ini = this.fechaInicioCliente;
    const fin = this.fechaFinCliente;

    this.api.getMovimientosPorClientePdf(clienteId, ini, fin)
      .pipe(finalize(() => {
        this.cargando = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data: any) => {
          // Caso 204 / body vacío: Angular puede entregar null
          if (!data) {
            this.errorMsgCliente = 'No hay movimientos en el rango seleccionado para generar el PDF.';
            return;
          }

          const base64 = data?.pdfBase64;

          if (!base64) {
            // Aquí ya es un problema real: endpoint no está devolviendo pdfBase64
            this.errorMsgCliente =
              'El servidor no devolvió el PDF en Base64. Verifique que el endpoint /reportes/movimientos-por-cliente/pdf retorne { pdfBase64 }.';
            return;
          }

          const filename = `movimientos_cliente_${clienteId}_${ini}_a_${fin}.pdf`;
          this.descargarBase64Pdf(base64, filename);
        },
        error: (err) => {
          // Si backend devuelve 404/500/etc
          this.errorMsgCliente = err?.error?.message || 'No se pudo descargar el PDF del cliente.';
        }
      });
  }

  /* =========================
     DESCARGA PDF Base64
     ========================= */
  private descargarBase64Pdf(base64: string, filename: string): void {
    const clean = base64.includes(',') ? base64.split(',')[1] : base64;

    const byteChars = atob(clean);
    const byteNumbers = new Array(byteChars.length);

    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }

    const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
  }
}
