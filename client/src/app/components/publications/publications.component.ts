import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../services/user.service';
import { GLOBAL } from '../../services/global';
import { Publication } from '../../models/publication';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { PublicationService } from '../../services/publication.service';

@Component({
  selector: 'publications',
  templateUrl: './publications.component.html',
  providers: [UserService,PublicationService]
})

export class PublicationsComponent implements OnInit{
    public title;
    public url;
    public identity;
    public token;
    public status;
    public page;
    public total;
    public pages;
    public itemsPerPage;
    public publications:Publication[];
    @Input() user: string;

    constructor(
        private _userService:UserService,
        private _publicationService:PublicationService,
        private _router:Router
    ){
        this.title = 'Publicaciones';
        this.url = GLOBAL.url;
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.page=1;
    }

    ngOnInit(){
        console.log('Se ha iniciado el componente publications');
        this.getPublications(this.user, this.page);
    }

    getPublications(user, page, adding = false){
        this._publicationService.getPublicationsUser(this.token, user,page).subscribe(
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

                        $("html, body").animate({ scrollTop: $('html').prop("scrollHeight")},500);
                    }

                    if(this.total == this.publications.length){
                      this.noMore = true;
                    }

                    if(!this.publications.length){
                        if(page > this.pages){
                            this._router.navigate(['/home']);
                        }
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

        this.getPublications(this.user, this.page, true);
    }
}