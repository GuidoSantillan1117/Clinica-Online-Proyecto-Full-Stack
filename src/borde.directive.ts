import { Directive,ElementRef,HostListener ,inject} from '@angular/core';

@Directive({
  selector: '[appBorde]'
})
export class BordeDirective {
  element: ElementRef<HTMLElement> = inject(ElementRef);

    @HostListener('mouseenter') onMouseEnter() {
    this.element.nativeElement.style.border = '2px solid rgb(93, 169, 199)'
  }
  @HostListener('mouseleave') onMouseLeave() {
    this.element.nativeElement.style.border = 'none';
  }
  constructor() {

   }

}
