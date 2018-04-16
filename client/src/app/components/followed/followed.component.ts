import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Follow } from '../../models/follow';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { GLOBAL } from '../../services/global';
import { FollowService } from '../../services/follow.service';


@Component({
  selector: 'followed',
  templateUrl: './followed.component.html',
  providers: [UserService,FollowService]
})

export class FollowedComponent implements OnInit{
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
    public follows;
    public followed;
    public userPageId;

    constructor(
        private _userService:UserService,
        private _route:ActivatedRoute,
        private _router:Router,
        private _followService: FollowService
    ){
        this.title = 'Usuarios siguiendo a ';
        this.url = GLOBAL.url;
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
    }

    ngOnInit(){
        console.log('Componente followed cargado');
        this.actualPage();
    }

    actualPage(){
        this._route.params.subscribe(params => {
            let user_id = params['id'];
            let page = +params['page'];
            this.page = page;
            this.userPageId = user_id;



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
            this.getUser(user_id, page);
        });
    }

    getFollows(user_id, page){
        this._followService.getFollowed(this.token, user_id, page).subscribe(
          response => {
            if(!response.follows){
                this.status = 'error';                
            } else{ 
                this.total = response.total;
                this.followed = response.follows;
                this.pages = response.pages;
                this.follows = response.users_following;
                if(page > response.pages){
                    this._router.navigate(['/gente',1]);
                }
            }
          },
          error => {
              let errorMessage = <any>error;

              if(errorMessage != null){
                  this.status = 'error';
              }
          }
        );
    }

    public followUserOver;
    mouseEnter(user_id){
        this.followUserOver = user_id;
    }

    mouseLeave(user_id){
        this.followUserOver = 0;
    }

    public user:User;
    getUser(user_id, page){
        this._userService.getUser(user_id).subscribe(
            response =>{
                if(response.user){
                    this.user = response.user;
                    this.getFollows(user_id, page);
                }else{
                    this._router.navigate(['/home']);
                }
            },
            error => {
                console.log(<any>error);
            }
        );
    }

    followUser(followed){
        let follow = new Follow('',this.identity._id,followed);

        this._followService.addFollow(this.token,follow).subscribe(
            response => {
                if(!response.follow){
                    this.status='error';
                }else{
                    this.status='success';
                    this.follows.push(followed);
                }

            },
            error =>{
                let errorMessage = <any>error;
                console.log(errorMessage);

                if(errorMessage != null){
                    this.status = 'error';
                }            
            });
    }

    unFollowUser(followed){
        this._followService.deleteFollow(this.token,followed).subscribe(
            response => {
                let search = this.follows.indexOf(followed);
                if(search != 1){
                    this.follows.splice(search, 1);
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