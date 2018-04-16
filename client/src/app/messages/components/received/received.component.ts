import { Component, OnInit, DoCheck } from '@angular/core';
import { Message } from '../../../models/message';
import { MessageService } from '../../../services/message.service';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { GLOBAL } from '../../../services/global';
import { Follow } from '../../../models/follow';
import { FollowService } from '../../../services/follow.service';
import { Route } from '@angular/compiler/src/core';
import { UserService } from '../../../services/user.service';

@Component({
    selector: 'received',
    templateUrl: './received.component.html',
    providers: [
        MessageService,
        FollowService,
        UserService
    ]    
  })

  export class ReceivedComponent implements OnInit{
      public title: string;
      public identity;
      public token;
      public url;
      public status;
      public follows;      
      public messages: Message[];
      public page;
      public pages;
      public total;
      public next_page;
      public prev_page;

      constructor(
        private _router:Router,
        private _route:ActivatedRoute,
        private _followService:FollowService,
        private _messageService:MessageService,
        private _userService:UserService
      ){
          this.title = 'Mensajes recibidos';
          this.identity = this._userService.getIdentity();
          this.token = this._userService.getToken();
          this.url = GLOBAL.url;          
      }

      ngOnInit(){
          console.log('El componente received se ha cargado');
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
            this.getMessages(this.token, this.page);
        });
    }      

      getMessages(token, page){
          this._messageService.getMyMessages(token, page).subscribe(
              response => {
                if(response.messages){
                    this.messages = response.messages;
                    this.total = response.total;
                    this.pages = response.pages;
                }
              },
              error => {
                console.log(<any>error);                
              }
          );
      }
  }