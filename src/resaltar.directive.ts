import { Directive,ElementRef,HostListener ,inject} from '@angular/core';

@Directive({
  selector: '[appResaltar]'
})
export class ResaltarDirective {
    element: ElementRef<HTMLElement> = inject(ElementRef);
  @HostListener('mouseenter') onMouseEnter() {
    this.element.nativeElement.style.background = 'rgb(181, 197, 212)';
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.element.nativeElement.style.background = 'none';
  }

  constructor() { }

}
