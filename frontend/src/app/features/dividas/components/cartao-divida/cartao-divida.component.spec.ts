import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { CartaoDividaComponent } from "./cartao-divida.component";
import { Divida } from "../../../../core/models/debt.model";

describe("CartaoDividaComponent", () => {
  let fixture: ComponentFixture<CartaoDividaComponent>;
  let componente: CartaoDividaComponent;
  const divida: Divida = {
    id: "d-1",
    credor: "Itaú Unibanco",
    descricao: "Cartão de crédito",
    valorOriginal: 1200,
    vencimento: "2026-05-10",
    status: "ATRASADA",
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartaoDividaComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CartaoDividaComponent);
    componente = fixture.componentInstance;
    fixture.componentRef.setInput("divida", divida);
    fixture.detectChanges();
  });

  it("emite a dívida ao solicitar uma simulação", () => {
    const simular = jest.fn();
    componente.simular.subscribe(simular);

    (
      fixture.nativeElement.querySelector("button") as HTMLButtonElement
    ).click();

    expect(simular).toHaveBeenCalledWith(divida);
  });

  it("marca o card como não renegociado quando ainda não há acordo", () => {
    const card = fixture.nativeElement.querySelector("mat-card");

    expect(card.classList.contains("nao-acordo")).toBe(true);
    expect(card.classList.contains("em-acordo")).toBe(false);
  });

  it("exibe os dados do acordo sem permitir uma nova simulação", () => {
    fixture.componentRef.setInput("divida", {
      ...divida,
      status: "EM_ACORDO",
      valorNegociado: 1000,
      saldoDevedor: 750,
      quantidadeParcelas: 4,
      valorParcela: 250,
      valorUltimaParcela: 250,
      proximoVencimento: "2026-09-10",
      acordoId: "a-1",
    } satisfies Divida);
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent.replace(/\s+/g, " ");
    expect(texto).toContain("Saldo devedor");
    expect(texto).toContain("R$750.00");
    expect(texto).toContain("4x de R$250.00");
    expect(texto).toContain("Próximo vencimento");
    expect(texto).toContain("10/09/2026");
    expect(texto).toContain("Em acordo");
    expect(fixture.nativeElement.querySelector("button")).toBeNull();
  });

  it("destaca o ajuste de centavos na última parcela", () => {
    fixture.componentRef.setInput("divida", {
      ...divida,
      status: "EM_ACORDO",
      saldoDevedor: 100,
      quantidadeParcelas: 3,
      valorParcela: 33.33,
      valorUltimaParcela: 33.34,
    } satisfies Divida);
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent.replace(/\s+/g, " ");
    expect(texto).toContain("2x de R$33.33 + última de R$33.34");
  });
});
