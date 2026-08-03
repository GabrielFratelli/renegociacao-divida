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
});
