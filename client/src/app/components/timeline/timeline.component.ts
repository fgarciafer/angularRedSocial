import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { GLOBAL } from '../../services/global';
import { Publication } from '../../models/publication';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { PublicationService } from '../../services/publication.service';

@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  providers: [UserService,PublicationService]
})

export class TimeLineComponent implements OnInit{
    public title;
    public url;
    public identity;
    public token;
    public status;
    public page;
    public total;
    public pages;
    public publications:Publication[];

    constructor(
        private _userService:UserService,
        private _publicationService:PublicationService,
        private _router:Router
    ){
        this.title = 'Timeline';
        this.url = GLOBAL.url;
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.page=1;
    }

    ngOnInit(){
        console.log('Se ha iniciado el componente timeline');
        this.getPublications(this.page);
    }

    getPublications(page){
        this._publicationService.getPublications(this.token,page).subscribe(
            response =>{
                console.log(response);
                if(response.publications){
                    this.publications = response.publications;
                    console.log(this.publications);
                    this.pages = response.pages;
                    this.total = response.total_items;
                    if(page > this.pages){
                        this._router.navigate(['/home']);
                    }
                }else{
                    this.status = 'error';
                }
            },
            error =>{
                var errorMessage = <any> error;
                if(!errorMessage){
                    this.status = 'error';
                }
            }
        );

    }
}