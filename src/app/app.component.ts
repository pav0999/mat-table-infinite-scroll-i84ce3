import {Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2} from '@angular/core';
import {BehaviorSubject, Observable, fromEvent} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {MatTable} from '@angular/material';

@Component({
  selector: 'my-table',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit, AfterViewInit {
  //@ViewChild(MatTable) public matTable: MatTable<Element[]>;
  @ViewChild('table', {read: ElementRef}) public matTableRef: ElementRef;
  public displayedColumns: string[] = ['created_at', 'state', 'number', 'title'];
  public dataSource: Observable<Element[]>;
  private dataStream: BehaviorSubject<Element[]>;
  private numberOfPagesInBuffer: number = 3;
  private firstPage: number = 1;
  private pageSize: number = 50;
  private totalNumberOfPages: number = 10; // input

  public get lastPage(): number {
    return Math.min(this.totalNumberOfPages, this.firstPage + this.numberOfPagesInBuffer -1);
  }
  
  constructor(private el: ElementRef,
              private renderer: Renderer2) {
    this.dataStream = new BehaviorSubject<Element[]>([]);
    this.dataSource = this.dataStream.asObservable();
  }
  
  public ngOnInit(): void {
    this.fetchData();
  }
  
  public ngAfterViewInit(): void {
    fromEvent(this.matTableRef.nativeElement, 'scroll')
         .pipe(debounceTime(700))
         .subscribe((e: any) => this.onTableScroll(e));
  }
  
  private onTableScroll(e: any): void {
    const tableViewHeight = e.target.offsetHeight // viewport: ~500px
    const tableScrollHeight = e.target.scrollHeight // length of all table
    const scrollLocation = e.target.scrollTop; // how far user scrolled
    
    // If the user has scrolled within 200px of the bottom, add more data
    const scrollThreshold = 200;
    
    const scrollUpLimit = scrollThreshold;
    if (scrollLocation < scrollUpLimit && this.firstPage > 1) {
      this.firstPage--;
      console.log(`onTableScroll() UP: firstPage decreased to ${this.firstPage}. Now fetching data...`);
      this.fetchData();
      this.scrollTo(tableScrollHeight/2 - 2*tableViewHeight);
    }
    
    const scrollDownLimit = tableScrollHeight - tableViewHeight - scrollThreshold;    
    if (scrollLocation > scrollDownLimit && this.lastPage < this.totalNumberOfPages) {
      this.firstPage++;
      console.log(`onTableScroll(): firstPage increased to ${this.firstPage}. Now fetching data...`);
      this.fetchData();
      this.scrollTo(tableScrollHeight/2 + tableViewHeight);
    }
  }
  
  private fetchData(): void {
    let pageData: Element[] = [];
    for (let i=this.firstPage; i<=this.lastPage; i++) {
      pageData = pageData.concat(this.generateFakePageData(i));
    }
    this.dataStream.next(pageData);
  }
  
  private generateFakePageData(forPage: number): Element[] {
    let fakePageData = [];
    let arr = [
  {
    "created_at": 1,
    "state": 1,
    "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    "number": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
  },
  {
    "created_at": 1,
    "state": 2,
    "title": "qui est esse",
    "number": "est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla"
  },
  {
    "created_at": 1,
    "state": 3,
    "title": "ea molestias quasi exercitationem repellat qui ipsa sit aut",
    "number": "et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut"
  },
  {
    "created_at": 1,
    "state": 4,
    "title": "eum et est occaecati",
    "number": "ullam et saepe reiciendis voluptatem adipisci\nsit amet autem assumenda provident rerum culpa\nquis hic commodi nesciunt rem tenetur doloremque ipsam iure\nquis sunt voluptatem rerum illo velit"
  },
  {
    "created_at": 1,
    "state": 5,
    "title": "nesciunt quas odio",
    "number": "repudiandae veniam quaerat sunt sed\nalias aut fugiat sit autem sed est\nvoluptatem omnis possimus esse voluptatibus quis\nest aut tenetur dolor neque"
  }
];
    // fakePageData.push(...Array.from<Element>({length: this.pageSize})
    // .map((_: any, i: number) => { return {created_at: ''+forPage, state: i+1}; }));

    // fakePageData.push(...(arr.splice(0, 30))
    // .map(item => { return {created_at: item.created_at, state: item.state, number: item.number, title: item.title}; }));
    fakePageData.push(...arr);
    // console.log(fakePageData);

    // this.tableDataService.fetchTableData('created', 'asc', forPage).subscribe(response => {
    //   console.log(response.data)
    // });
    return fakePageData;
  }
  
  private scrollTo(position: number): void {
    this.renderer.setProperty(this.matTableRef.nativeElement, 'scrollTop', position);
  }
}
