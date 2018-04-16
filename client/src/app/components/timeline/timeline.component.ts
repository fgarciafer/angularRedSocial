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
    public itemsPerPage;
    public showImage;
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

    getPublications(page, adding = false){
        this._publicationService.getPublications(this.token,page).subscribe(
            response =>{
                if(response.publications){
                    this.pages = response.pages;
                    this.total = response.total_items;
                    this.itemsPerPage = response.items_per_page;

                    if(!adding){
                        this.publications = response.publications;
                    } else{
                        var arrayA = this.publications;
                        var arrayB = response.publications;
                        this.publications = arrayA.concat(arrayB);

                        $("html, body").animate({ scrollTop: $('body').prop("scrollHeight")},500);
                    }

                    if(this.total == this.publications.length){
                      this.noMore = true;
                    }

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
    public noMore = false;
    viewMore(){
        this.page +=1;

        if(this.page == this.pages){
            this.noMore = true;
        }            
        
        this.getPublications(this.page,true)
        
    }

    refresh(event=null){
        this.getPublications(1);
    }

    showThisImage(id){
        this.showImage = id;
    }

    hideThisImage(){
        this.showImage = null;
    }

    deletePublication(id){
        this._publicationService.deletePublication(this.token, id).subscribe(
            response => {
                this.refresh();
            },
            error => {
                console.log(<any>error);
            }
        );
    }
}