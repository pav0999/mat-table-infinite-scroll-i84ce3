import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class AppService {

  constructor(private http: HttpClient) {}

  // fetchTableData(payload: any): Observable<TableDataResult> {
  //   return this.http
  //     .get("https://api.github.com/repos/angular/angular/issues?page=" + payload.pageNo + "&per_page=" + payload.pageCount + "&state=all")
  //     .pipe(
  //       map((response: any) => {
  //         let columns = [];
  //         // for (const c of Object.keys(response.value[0])) {
  //         //   const column = {};
  //         //   column["title"] = c;
  //         //   column["width"] = 240;
  //         //   columns.push(column);
  //         // }
  //         return new TableDataResult(response, columns);
  //       })
  //     );
  // }

  fetchTableData(payload: any): Observable<any> {
    return this.http
      .get("https://api.github.com/repos/angular/angular/issues?page=" + payload.pageNo + "&per_page=" + payload.pageCount + "&state=all");
  }
}

class TableDataResult {
  data = [];
  columns = [];

  constructor(data: any[], columns: any[]) {
    this.data = data;
    this.columns = columns;
  }
}