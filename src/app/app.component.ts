import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Renderer2
} from "@angular/core";
import { BehaviorSubject, Observable, fromEvent } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { MatTable } from "@angular/material";
import { AppService } from "./app.service";
import "rxjs/add/operator/merge";
import { timer, combineLatest } from "rxjs";

@Component({
  selector: "my-table",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild("table", { read: ElementRef }) public matTableRef: ElementRef;
  public displayedColumns: string[] = [
    "created_at",
    "state",
    "number",
    "title"
  ];
  public dataSource: Observable<any[]>;
  private dataStream: BehaviorSubject<any[]>;
  private numberOfPagesInBuffer: number = 3;
  private firstPage: number = 1;
  private pageSize: number = 30;
  private totalNumberOfPages: number = 100; // input

  public get lastPage(): number {
    return Math.min(
      this.totalNumberOfPages,
      this.firstPage + this.numberOfPagesInBuffer - 1
    );
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private appService: AppService
  ) {
    this.dataStream = new BehaviorSubject<any[]>([]);
    this.dataSource = this.dataStream.asObservable();
  }

  public ngOnInit(): void {
    this.fetchData();
  }

  public ngAfterViewInit(): void {
    fromEvent(this.matTableRef.nativeElement, "scroll")
      .pipe(debounceTime(500))
      .subscribe((e: any) => {
        this.onTableScroll(e);
        });
  }

  private onTableScroll(e: any): void {
    const tableViewHeight = e.target.offsetHeight; // viewport: ~500px
    const tableScrollHeight = e.target.scrollHeight; // length of all table
    const scrollLocation = e.target.scrollTop; // how far user scrolled

    // If the user has scrolled within 200px of the bottom, add more data
    const scrollThreshold = 200;

    const scrollUpLimit = scrollThreshold;
    if (scrollLocation < scrollUpLimit && this.firstPage > 1) {
      this.firstPage--;
      // console.log(
      //   `onTableScroll() UP: firstPage decreased to ${
      //     this.firstPage
      //   }. Now fetching data...`
      // );
      this.fetchData();
      this.scrollTo(tableScrollHeight / 2 - 2 * tableViewHeight);
    }

    const scrollDownLimit =
      tableScrollHeight - tableViewHeight - scrollThreshold;
    if (
      scrollLocation > scrollDownLimit &&
      this.lastPage < this.totalNumberOfPages
    ) {
      this.firstPage++;
      // console.log(
      //   `onTableScroll(): firstPage increased to ${
      //     this.firstPage
      //   }. Now fetching data...`
      // );
      this.fetchData();
      this.scrollTo(tableScrollHeight / 2 + tableViewHeight);
    }
  }

  private fetchData(): void {
    let pageData = [];
    let merged = [];
    for (let i = this.firstPage; i <= this.lastPage; i++) {
      pageData = pageData.concat(this.retrievePageData(i));
    }
    combineLatest(...pageData).subscribe(res => {
       merged = [].concat.apply([], res);
       this.dataStream.next(merged);
    });
  }

  private retrievePageData(forPage: number) {
    const payload = {
      pageNo: forPage,
      pageCount: this.pageSize
    };
    return this.appService.fetchTableData(payload);
  }

  private scrollTo(position: number): void {
    this.renderer.setProperty(
      this.matTableRef.nativeElement,
      "scrollTop",
      position
    );
  }
}
