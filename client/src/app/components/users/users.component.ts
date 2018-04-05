import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { GLOBAL } from '../../services/global';


@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  providers: [UserService]
})

export class UsersComponent implements OnInit{
    public title:string;
    public identity;
    public token;
    public url: string;
    public page;
    public next_page;
    public prev_page;
    public total;
    public pages;
    public users: User[];
    public status:string;

    constructor(
        private _userService:UserService,
        private _route:ActivatedRoute,
        private _router:Router
    ){
        this.title = 'Gente';
        this.url = GLOBAL.url;
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
    }

    ngOnInit(){
        console.log('Componente users cargado');
        this.actualPage();
    }

    actualPage(){
        this._route.params.subscribe(params => {
            let page = +params['page'];
            this.page = page;

            if(!params['page']){
                page=1;
            }

            if(!page){
                page = 1;
            }else{
                this.next_page = page+1;
                this.prev_page = page-1;

                if(this.prev_page <= 0){
                    this.prev_page = 1;
                }
            }

            // devolver listado de usuarios
            this.getUsers(page);
        });
    }

    getUsers(page){
        this._userService.getUsers(page).subscribe(
          response => {
            if(!response.users){
                this.status = 'error';                
            } else{ 
                this.total = response.total;
                this.users = response.users;
                this.pages = response.pages;

                if(page > response.pages){
                    this._router.navigate(['/gente',1]);
                }
            }
          },
          error => {
              let errorMessage = <any>error;
              console.log(errorMessage);

              if(errorMessage != null){
                  this.status = 'error';
              }
          }
        );
    }
}