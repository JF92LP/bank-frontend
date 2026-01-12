import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Cliente } from '../../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // =========================
  // CLIENTES
  // =========================
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.baseUrl}/clientes`);
  }

  createCliente(payload: Omit<Cliente, 'clienteId'>): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/clientes`, payload);
  }

  updateCliente(clienteId: number, payload: Partial<Cliente>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/clientes/${clienteId}`, payload);
  }

  deleteCliente(clienteId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clientes/${clienteId}`);
  }

  // =========================
  // REPORTES - POR NÚMERO DE CUENTA (JSON)
  // =========================
  getReporteEstadoCuenta(numeroCuenta: string, fechaInicio: string, fechaFin: string) {
    const params = { numeroCuenta, fechaInicio, fechaFin };
    return this.http.get<any>(`${this.baseUrl}/reportes/estado-cuenta`, { params });
  }

  // =========================
  // REPORTES - POR NÚMERO DE CUENTA (PDF Base64 dentro de JSON)
  // =========================
  getReporteEstadoCuentaPdf(numeroCuenta: string, fechaInicio: string, fechaFin: string) {
    const params = { numeroCuenta, fechaInicio, fechaFin, incluirPdf: 'true' };
    return this.http.get<any>(`${this.baseUrl}/reportes/estado-cuenta`, { params });
  }

  // =========================
  // CUENTAS
  // =========================
  getCuentasPorCliente(clienteId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/cuentas/cliente/${clienteId}`);
  }

  createCuenta(clienteId: number, payload: any) {
    return this.http.post(`${this.baseUrl}/cuentas/cliente/${clienteId}`, payload);
  }

  updateCuenta(cuentaId: number, payload: any) {
    return this.http.put(`${this.baseUrl}/cuentas/${cuentaId}`, payload);
  }

  deleteCuenta(cuentaId: number) {
    return this.http.delete(`${this.baseUrl}/cuentas/${cuentaId}`);
  }

  // =========================
  // MOVIMIENTOS
  // =========================
  createMovimiento(payload: { numeroCuenta: string; tipoMovimiento: string; valor: number }) {
    return this.http.post<any>(`${this.baseUrl}/movimientos`, payload);
  }

  getMovimientosPorCuenta(numeroCuenta: string) {
    return this.http.get<any[]>(`${this.baseUrl}/movimientos/cuenta/${numeroCuenta}`);
  }

  // =========================
  // REPORTES - POR CLIENTE + RANGO (JSON)
  // =========================
  getMovimientosPorCliente(clienteId: number, fechaInicio: string, fechaFin: string) {
    const params = { clienteId, fechaInicio, fechaFin };
    return this.http.get<any[]>(`${this.baseUrl}/reportes/movimientos-por-cliente`, { params });
  }

  // =========================
  // REPORTES - POR CLIENTE + RANGO (PDF Base64)
  // Backend: GET /reportes/movimientos-por-cliente/pdf
  // Respuesta esperada: { pdfBase64: "..." }
  // =========================
  getMovimientosPorClientePdf(clienteId: number, fechaInicio: string, fechaFin: string) {
    const params = { clienteId, fechaInicio, fechaFin };
    return this.http.get<any>(`${this.baseUrl}/reportes/movimientos-por-cliente/pdf`, { params });
  }

  // =========================
  // (Opcional) REPORTES - CUENTAS POR CLIENTE (solo números de cuenta)
  // Backend: GET /reportes/cuentas-por-cliente?clienteId=...
  // =========================
  getNumerosCuentaPorCliente(clienteId: number) {
    const params = { clienteId };
    return this.http.get<string[]>(`${this.baseUrl}/reportes/cuentas-por-cliente`, { params });
  }

  // =========================
  // (Opcional) REPORTES - ESTADO DE CUENTA POR CLIENTE (todas las cuentas)
  // Backend: GET /reportes/estado-cuenta-por-cliente?clienteId=...&fechaInicio=...&fechaFin=...&incluirPdf=false|true
  // =========================
  getEstadoCuentaPorCliente(clienteId: number, fechaInicio: string, fechaFin: string, incluirPdf = false) {
    const params: any = { clienteId, fechaInicio, fechaFin };
    if (incluirPdf) params.incluirPdf = 'true';
    return this.http.get<any[]>(`${this.baseUrl}/reportes/estado-cuenta-por-cliente`, { params });
  }
}
