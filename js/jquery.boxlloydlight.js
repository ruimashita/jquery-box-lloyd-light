/**
 * jQuery Box Lloyd Light plugin
 * This jQuery plugin based on
 * jQuery Lightbox by Leandro Vieira Pinho (http://leandrovieira.com/projects/jquery/lightbox/)
 * and Lightbox by Lokesh Dhakar (http://www.huddletogether.com/projects/lightbox/)
 * @name Box Lloyd Light
 * @author Rui Mashita - http://retujyou.com
 * @version 0.1
 * @date 2010/08/10
 * @category jQuery plugin
 * @copyright (c) 2010 Rui Mashita (retujyou.com)
 * @license CCAttribution-ShareAlike 2.5 Brazil - http://creativecommons.org/licenses/by-sa/2.5/br/
 * @example http://
 */
(function($) {

    $.boxLloydLight = function( obj, objs, options ){
        this.obj = obj;
        var self = this;
        
        // When hover 
        obj.hover(
            function(){
                self.setZoomImage($(this));
            },function(){
                self.removeZoomImage($(this));
            }
        );

        // When click. Unbind method is used to avoid click conflict when the plugin is called more than once
		obj.unbind('click').click(function(event){
            event.preventDefault(); 
            self.init(objs, options);
        });

        
    };
    
    $.extend( $.boxLloydLight.prototype,{
        init: function(objs, options){
            
            this.objs = objs;

            this.setOption(options);
            this.buildBllHtml();
            
            this.setMember();
            this.setBll();
            
			// Call the function that prepares image exibition
			this.loadMainImage();
            if(this.thumb == true){
                this.loadThumbImages();
            }
            
        },
        
        setOption : function(options){
            this.options = $.extend({
			    // Configuration related to overlay
			    overlayBgColor: 		'#000',		// (string) Background color to overlay; 
			    overlayOpacity:			0.8,		// (integer) Opacity value to overlay; 

                
			    // Configuration related to main
                mainBoxMarginHeight: 20,
			    mainImageBorderSize:	10,			// (integer) mainImg
			    mainImageResizeSpeed:	300,		// (integer) Specify the resize duration. These number are miliseconds. 300 is default.
                dataBoxHeight: 20,

                thumbBoxMarginHeight: 10,
                // thumbnail image size . default 75 (px).
                thumbImageSize:         75,
                thumbImageOpacity:         0.5,
                thumbImageMarginSize:   2,
                // thumbnail image effect
                thumbEffectType:         'Fade',       // (string) Type fo thumbImage Effect. [ Transfer | Fade ]
                thumbEffectSpeed:    100,
                
			    // Configuration related to texts in caption. For example: Image 2 of 8. You can alter either "Image" and "of" texts.
                txtImage:				'',	// (string) Specify text "Image"
			    txtOf:					'/'		// (string) Specify text "of"

		    },options);

        },
        
        buildBllHtml : function(){

            /**
		     * Create the boxLloydLight gallery
		     *
		     * The HTML markup will be like that:
             *
             */
            // Apply the HTML markup into body tag
            $('body').append('<div id="boxLloydLight" >  <div class="overlay" ></div>  <div class="inner">        <div class="mainBox">           <div class="mainBoxInner" >        	    <img src="hoge.jpg" class="photo" />                      <div class="loading"></div>            </div>           <div class="navi">						<a href="#" class="prev"></a>					      <a href="#" class="close"></a>		      <a href="#" class="next"></a>				</div>           </div>        <div class="dataBox">      <div class="dataBoxInner">            <div class="caption">aaaa</div>               <div class="currentNum">aaaa</div>      </div>          </div>    <div class="thumbBox">       <div class="thumbBoxInner">        <div class="thumbImageBox">                  </div>      </div>      <div class="navi">						<a href="#" class="prev"></a>						      <a href="#" class="next"></a>	      </div>          </div>    </div></div>');

            // Hime some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
			$('embed, object, select').css({ 'visibility' : 'hidden' });
            
        },

        setMember: function(){
            var self = this;
            this.bllObj = [];
            this.imageArray = [];
		    this.activeImage  = 0;
            this.arrayPageSize = [];
            this.arrayPageScroll = [];
            this.thumbBoxInnerWidth = 0;
            this.thumbImageBoxWidth = 0;
            this.thumb = true;
            
            
            this.bllObj = $("#boxLloydLight");
            // Unset total images in imageArray
			this.imageArray.length = 0;
			// Unset image active information
			this.activeImage = 0;
			// We have an image set? Or just an image? Lets see it.
			if ( this.objs.length == 1 ) {
                this.thumb = false;
				this.imageArray.push( new Array(this.obj.attr('href'), $('img', this.obj).attr('title')));
			} else {
		        this.objs.each(function(){
	                self.imageArray.push( new Array(this.getAttribute('href'), $('img', this).attr('title')));
                });
			}
            
			while ( this.imageArray[this.activeImage][0] != this.obj.attr('href') ) {
			 	this.activeImage++;
			}

            
            
            // Get page sizes
            this.arrayPageSize = this.getPageSize();
            // Get page scroll
			this.arrayPageScroll = this.getPageScroll();

            this.thumbBoxInnerWidth = this.arrayPageSize[2]  - this.options.thumbImageSize * 2;
            this.thumbImageBoxWidth = this.objs.length * ( this.options.thumbImageSize + this.options.thumbImageMarginSize );
            
        },

        setBll: function(){
            var self = this;
            
  			// Style overlay and show it
			$('.overlay', this.bllObj).css({
				backgroundColor:	self.options.overlayBgColor,
				opacity:			self.options.overlayOpacity,
				width:				self.arrayPageSize[0],
				height:				self.arrayPageSize[1]
			}).fadeIn();
            
			// Calculate top and left offset for the inner div object and show it
			$('.inner', this.bllObj).css({
				top:	self.arrayPageScroll[1] ,
				left:	self.arrayPageScroll[0]
			}).show();

            // pre thumbox postion 
            $('.thumbBox').css({
                position: 'absolute',
                top: self.arrayPageSize[2],
                left: 0
            });
            
            // Assigning click events in elements to close overlay
			$('.overlay, .inner', this.bllObj).bind('click', function(event) {
                event.preventDefault();
				self.finish();
			});
            
			// Assign the finish function to close button
			$('.close', this.bllObj).click(function(event) {
                event.preventDefault(); 
				self.finish();
			});

            
			// If window was resized, calculate the new overlay dimensions
			$(window).resize(function() {
                
				// Get page sizes
			    self.arrayPageSize = self.getPageSize();
				// Style overlay and show it
				$('.overlay', self.bllObj).css({
					width:		self.arrayPageSize[0],
					height:		self.arrayPageSize[1]
				});
				// Get page scroll
				self.arrayPageScroll = self.getPageScroll();
				// Calculate top and left offset for the jquery-lightbox div object and show it
				$('.inner', self.bllObj).css({
					top:	self.arrayPageScroll[1],
					left:	self.arrayPageScroll[0]
				});

                if(self.thumb == true){
                    self.thumbBoxInnerWidth = self.arrayPageSize[2]  - self.options.thumbImageSize * 2;
                    self.setThumbBox();                    
                }

			});
        },
        
	    loadMainImage: function() { // show the loading
            var self = this;
			// Show the loading
			$('.loading' , this.bllObj).show();

            // Hide some elements
			$('.photo, .close, .dataBox, .caption, .currentNum', this.bllObj).hide();
			$('.mainBox .navi, .mainBox .prev, .mainBox .next ', this.bllObj).hide();
            
			// Image preload process
			var objImagePreloader = new Image();
			objImagePreloader.onload = function() {
				$('.photo', self.bllObj).attr('src', self.imageArray[self.activeImage][0]);
				// Perfomance an effect in the image container resizing it
        		self.resizeMainImageBox(objImagePreloader.width, objImagePreloader.height);
				//	clear onLoad, IE behaves irratically with animated gifs otherwise
				objImagePreloader.onload=function(){};
			};
			objImagePreloader.src = this.imageArray[this.activeImage][0];
		},

        
		/**
		 * Perfomance an effect in the image container resizing it
		 *
		 * @param integer intImageWidth The image width that will be showed
		 * @param integer intImageHeight The image height that will be showed
		 */
		resizeMainImageBox: function(intImageWidth,intImageHeight) {
            var self = this;
            var aspect = intImageWidth / intImageHeight;

            var maxWidth =  this.arrayPageSize[2] - (this.options.mainImageBorderSize * 2) - (this.options.mainBoxMarginHeight *2);
            var maxHeight = this.arrayPageSize[3] - (this.options.mainImageBorderSize * 2) - this.options.thumbImageSize - this.options.dataBoxHeight - (this.options.thumbBoxMarginHeight * 2) - (this.options.mainBoxMarginHeight *2) ;
            if (intImageWidth > maxWidth ){
                intImageWidth = maxWidth;
                intImageHeight = intImageWidth / aspect; 
            }
            
            if (intImageHeight > maxHeight ){
                intImageHeight = maxHeight;
                intImageWidth = intImageHeight * aspect; 
            }

			// Get current width and height
			var intCurrentWidth = $('.mainBox' , this.bllObj).width();
			var intCurrentHeight = $('.mainBox' , this.bllObj).height();
			// Get the width and height of the selected image plus the padding
			var intWidth = (intImageWidth + (this.options.mainImageBorderSize * 2)); // Plus the image's width and the left and right padding value
	        var intHeight = (intImageHeight + (this.options.mainImageBorderSize * 2)); // Plus the image's height and the left and right padding value
            
			// Diferences
            var intDiffW = intCurrentWidth - intWidth;
			var intDiffH = intCurrentHeight - intHeight;
            
			// Perfomance the effect
            $('.mainBox' , this.bllObj).css({
                width: intWidth,
                height: intHeight,
                marginTop: self.options.mainBoxMarginHeight
            });

            $('.photo', this.bllObj).css({ width: intImageWidth, height: intImageHeight});
            
			$('.mainBoxInner' , this.bllObj).css({top: self.options.mainImageBorderSize})
                .animate(
                    { width: intImageWidth -50, height: intImageHeight -50 },
                    self.options.mainImageResizeSpeed,
                    function() {
                        
                        $(this).animate(
                            { width: intImageWidth, height: intImageHeight  },
                            self.options.mainImageResizeSpeed,
                            function() {
                                self.showMainImage();
                            }
                        );
                    }
                );
            
			if ( ( intDiffW == 0 ) && ( intDiffH == 0 ) ) {
				if ( $.browser.msie ) {
					this.pause(250);
				} else {
					this.pause(100);	
				}
			} 
			$('.dataBox', this.bllObj).css({ width: intImageWidth });

            
		},
		/**
		 * Show the prepared image
		 *
		 */
		showMainImage: function() {
            var self = this;
			$('.loading', this.bllObj).hide();
			$('.photo', this.bllObj).fadeIn(function() {
                //    this.fn.boxLloydLight.showDataBox();
				self.showDataBox();
				self.setMainNavi();
            });
			this.preloadNeighborImages();
            
		},
		/**
		 * Show the image information
		 *
		 */
		showDataBox: function() {
            var self = this;
            
		    if ( this.imageArray[this.activeImage][1] ) {
			    $('.caption', this.bllObj)
                    .css({height: self.options.dataBoxHeight, paddingTop: self.options.dataBoxHeight/2, paddingBottom: self.options.dataBoxHeight/2})
                    .text(self.imageArray[self.activeImage][1])
                    .show();
			}
            
			if ( this.imageArray.length > 1 ) {
				$('.currentNum', this.bllObj)
                    .css({height: self.options.dataBoxHeight, paddingTop: self.options.dataBoxHeight/2, paddingBottom: self.options.dataBoxHeight/2})
                    .text( self.options.txtImage + ' ' + ( self.activeImage + 1 ) + ' ' + self.options.txtOf + ' ' + self.imageArray.length)
                    .show();
			}

            $('.dataBox', this.bllObj)
                .css({height: self.options.dataBoxHeight})
                .slideDown('slow');
            
            
		},
		/**
		 * Display the button navigations
		 *
		 */
		setMainNavi: function() {
            var self = this;
			$('.mainBox .navi', this.bllObj).show();
		    $('.close', this.bllObj).show();
            // Show the prev button, if not the first image in set
			if ( this.activeImage != 0 ) {

				$('.mainBox .prev', this.bllObj).unbind().show().bind('click',function(event) {
                    event.preventDefault();
                    event.stopPropagation();
					self.activeImage = self.activeImage - 1;
					self.loadMainImage();
                    $('.thumbImageBox a img', self.bllObj).stop().css({opacity: 0.3})
                        .eq(self.activeImage).fadeTo(2000, 1);
				    
				});
				
			}
			
			// Show the next button, if not the last image in set
			if ( this.activeImage != ( this.imageArray.length -1 ) ) {
			    
				// Show the images button for Next buttons
				$('.mainBox .next', this.bllObj).unbind().show().bind('click',function(event) {
                    event.preventDefault();
                    event.stopPropagation();
					self.activeImage = self.activeImage + 1;
					self.loadMainImage();
                    $('.thumbImageBox a img', self.bllObj).stop().css({opacity: 0.3})
                        .eq(self.activeImage).fadeTo(2000, 1);
				});
				
			}

		},
        /**
		 * Preload prev and next images being showed
		 *
		 */
		preloadNeighborImages: function() {
			if ( (this.imageArray.length -1) > this.activeImage ) {
			    var objNext = new Image();
				objNext.src = this.imageArray[this.activeImage + 1][0];
			}
			if ( this.activeImage > 0 ) {
			    var	objPrev = new Image();
				objPrev.src = this.imageArray[this.activeImage -1][0];
			}
		},

        /**
		 *
		 *
		 */
		loadThumbImages: function() {
            var self = this;
            
            this.setThumbBox();
            
            var count = 0;
			// Image preload process
            var preloadThumbImages = new Array();
            this.objs.each(function(i){

                var eachObj = $(this);
              	preloadThumbImages[i] = new Image();
                
                
			    preloadThumbImages[i].onload = function() {
                    
                    $('.thumbImageBox a' ,self.bllObj).eq(i)
                        .append(preloadThumbImages[i]);
                    
                    $(preloadThumbImages[i]).css({ opacity: 0});
                    self.resizeThumbImage($(preloadThumbImages[i]), preloadThumbImages[i].width, preloadThumbImages[i].height);
                    
                    count++;
                    // thumbImg onload completed
                    if(count == self.imageArray.length){
                        $('.thumbBox', this.bllObj).css({
                            position: 'relative',
                            top: 0
                        });
                        self.showThumbImage();
                        self.setThumbEvent();
                    }

                    //	clear onLoad, IE behaves irratically with animated gifs otherwise
				    preloadThumbImages[i].onload=function(){};
                    
                };
                
		        preloadThumbImages[i].src = $('img', eachObj).attr('src');
                
			});

            
            
		},
        
        /**
		 *
		 *
		 */
		setThumbBox: function() {
            var self = this;

            $('.thumbBox .navi, .thumbBox .prev, .thumbBox .next ', this.bllObj).hide();
            
            // $('.thumbBox', this.bllObj).css({
            //     position: 'relative',
            //     top: 0,
            //     width: self.arrayPageSize[2] ,
            //     height: self.options.thumbImageSize,
            //     marginTop: self.options.thumbBoxMarginHeight
            // });

            $('.thumbBox', this.bllObj).css({
                width: self.arrayPageSize[2] ,
                height: self.options.thumbImageSize,
                marginTop: self.options.thumbBoxMarginHeight
            });

            var thumbImageBoxObj = $('.thumbImageBox', this.bllObj);
            
            // when you can view all thumbs  
            if( this.thumbBoxInnerWidth > this.thumbImageBoxWidth){
                this.thumbBoxInnerWidth = this.thumbImageBoxWidth;
                thumbImageBoxObj.css({ left : 0});                
                this.thumbNavi = 'hide';
            }else{
                this.thumbNavi = 'show';
            }
            
            $('.thumbBoxInner', this.bllObj).css({
                width: self.thumbBoxInnerWidth,
                height: self.options.thumbImageSize
            });

            thumbImageBoxObj.css({
                width: self.thumbImageBoxWidth
            });


            this.objs.each(function(i){
                
                $('<a />').appendTo(thumbImageBoxObj)
                    .attr('href', self.imageArray[i][0])
                    .css({
                        width: self.options.thumbImageSize,
                        height: self.options.thumbImageSize,
                        marginLeft: self.options.thumbImageMarginSize,
                        display: 'block'
                    });
                
            });

            this.showThumbNavi();
            
		},
        /**
		 *
		 *
		 */
		showThumbNavi: function() {
            var self = this;
            
            if(this.thumbNavi == 'hide'){
                
            }else{
                
                var naviObj = $('.thumbBox .navi', this.bllObj).show();
                
                $('.prev', naviObj).css({
                    width: self.options.thumbImageSize,
                    height: self.options.thumbImageSize
                });

                if( $('.thumbImageBox', this.bllObj).css('left') == '0px'){
                    
                    $('.prev', naviObj).hide();
                }else{
                    $('.prev', naviObj).show();
                }
                
                $('.next', naviObj).css({
                    width: self.options.thumbImageSize,
                    height: self.options.thumbImageSize
                }).show();
                
                $('.prev, .next', naviObj).bind('click', function(event){
                    event.preventDefault();
                    event.stopPropagation();
                    self.slideThumbNavi(this);
                });
                
            }

            
            
		},
        /**
		 *
		 *
		 */
		slideThumbNavi: function(clickedElem) {
            var action = $(clickedElem).attr('class');
            var naviObj = $('.thumbBox .navi', this.bllObj).show();
            var currentPosition = parseInt($('.thumbImageBox', this.bllObj).css('left').match(/-?\d+/));
            var movePosition;
            var minLeft = this.thumbBoxInnerWidth - this.thumbImageBoxWidth;
            var maxLeft = 0;
            
            if(action == 'next'){
                movePosition = currentPosition - (this.options.thumbImageSize + this.options.thumbImageMarginSize)*4;
                
                if(movePosition < minLeft ){ movePosition = minLeft;}
            }else{
                movePosition = currentPosition + (this.options.thumbImageSize + this.options.thumbImageMarginSize)*4;
                if(movePosition > maxLeft){ movePosition = maxLeft;}
            }
            
            $('.thumbImageBox', this.bllObj).stop().animate(
                {left: movePosition },
                500,
                function(){
                    if( $(this).css('left') == maxLeft + 'px'){
                        $('.prev', naviObj).hide();
                        $('.next', naviObj).show();
                    }else if( $(this).css('left') == minLeft + 'px'){
                        $('.prev', naviObj).show();
                        $('.next', naviObj).hide();
                    }else{
                        $('.prev', naviObj).show();
                        $('.next', naviObj).show();
                    }
                }
            );

            
            
		},
        
        /**
		 * 
		 *
		 */
		resizeThumbImage: function(thumbImageObj, intThumbImageWidth, intThumbImageHeght) {
            var aspect =  intThumbImageWidth / intThumbImageHeght ;
            if ( intThumbImageWidth < intThumbImageHeght) {
                thumbImageObj.css({
                    height: 'auto',
                    width: this.options.thumbImageSize,
                    marginTop: - Math.ceil( 1/aspect * this.options.thumbImageSize - this.options.thumbImageSize)/2
                });		
		    } else {
        	    thumbImageObj.css({
                    width: 'auto',
                    height: this.options.thumbImageSize,
                    marginLeft: - Math.ceil( aspect * this.options.thumbImageSize - this.options.thumbImageSize)/2
                });		    
            }
            
        },

        /**
		 * 
		 *
		 */
        showThumbImage: function() {
            var self = this,
                i = 0,
                thumbImageBoxAObjs = $('.thumbImageBox a', self.bllObj),
                thumbImageBoxImgObjs = $('img', thumbImageBoxAObjs),
                imgObjs = $('img', this.objs);
            
            // this.objs.eq(i).effect(
            //     "transfer",
            //     {to: thumbImageBoxAObjs.eq(i),
            //      className: "boxLloydLightTransfer"},
            //     100,
            //     function(){
            //         thumbImageBoxImgObjs.eq(i).fadeTo(1000, 0.3);
            //         i++;

            //         // if completed
            //         if (i == self.imageArray.length){
            //             thumbImageBoxImgObjs.eq(self.activeImage).stop().fadeTo(1000, 1);
            //         }
            
            //         self.objs.eq(i).effect(
            //             "transfer",
            //             {to: thumbImageBoxAObjs.eq(i),
            //              className: "boxLloydLightTransfer"},
            //             100,
            //             arguments.callee);
            //     });

            if (self.options.thumbEffectType == 'Transfer'){
                

                imgObjs.eq(i).boxLloydLightTransfer(
                    {to: thumbImageBoxAObjs.eq(i),
                     className: "boxLloydLightTransfer"},
                    self.options.thumbEffectSpeed,
                    function(){
                        thumbImageBoxImgObjs.eq(i).fadeTo(1000, self.options.thumbImageOpacity);
                        i++;
                        // if completed
                        if ( i == self.imageArray.length){
                            thumbImageBoxImgObjs.eq(self.activeImage).fadeTo(1000, 1);
                        }
                        imgObjs.eq(i).boxLloydLightTransfer(
                            {to: thumbImageBoxAObjs.eq(i),
                             className: "boxLloydLightTransfer"},
                            self.options.thumbEffectSpeed,
                            arguments.callee);
                    });
                
            }else if(self.options.thumbEffectType == 'Fade'){

                thumbImageBoxImgObjs.eq(i).fadeTo(
                    self.options.thumbEffectSpeed,
                    self.options.thumbImageOpacity, 
                    function(){
                    
                    i++;
                    // if completed
                    if ( i == self.imageArray.length){
                        thumbImageBoxImgObjs.eq(self.activeImage).fadeTo(self.options.thumbEffectSpeed, 1);
                    }
                    thumbImageBoxImgObjs.eq(i).fadeTo(self.options.thumbEffectSpeed, self.options.thumbImageOpacity, arguments.callee);
                });
               
         
              

            }

        },

            setThumbEvent: function(){
                var self = this,
                thumbImageBoxAObjs = $('.thumbImageBox a'),
                thumbImageBoxImgObjs = $('img', thumbImageBoxAObjs);
                
                // add click event
                thumbImageBoxAObjs.bind('click' ,function(event){
                    event.preventDefault();
                    event.stopPropagation();
                    self.activeImage = $(this).index();
				    self.loadMainImage();
                    
                    thumbImageBoxImgObjs.stop().fadeTo(1000, self.options.thumbImageOpacity)
                        .eq(self.activeImage).fadeTo(2000, 1);

                });
                
                thumbImageBoxAObjs.hover(
                    function(){
                        thumbImageBoxImgObjs.eq(self.activeImage).stop().fadeTo(1000, self.options.thumbImageOpacity);
                        $('img', this).stop().fadeTo(400, 1);
                    },function(){
                        thumbImageBoxImgObjs.eq(self.activeImage).stop().fadeTo(2000, 1);
                        $('img', this).stop().fadeTo(800, self.options.thumbImageOpacity);
                    });
                
            },
        
	    
		
        
        setZoomImage : function(hoverObj){
            var html = $('<div id="boxLloydLightHover" />')
                .append('<div class="zoom" />')
                .append('<div class="bg" />');
            hoverObj.css({ 'position' : 'relative', 'display' : 'inline-block'})
                .append(html)
                .find('#boxLloydLightHover .bg').css({ 'opacity' : '0.3'});
        },
        
        removeZoomImage: function(hoverObj){
            $('#boxLloydLightHover', hoverObj).remove();
        },
        
        /**
		 * Remove boxLloydLight HTML markup
		 *
		 */
		finish: function() {
            
			$('.inner', this.bllObj).remove();
			$('.overlay', this.bllObj).fadeOut(function(){
                $(this).remove();
            });
			// Show some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
	        this.bllObj.remove();
            $('embed, object, select').css({ 'visibility' : 'visible' });
		    },
        
        /**
		   / THIRD FUNCTION
		   * getPageSize() by quirksmode.com
		   *
		   * @return Array Return an array with page width, height and window width, height
		   */
		getPageSize: function() {
			var xScroll, yScroll;
			if (window.innerHeight && window.scrollMaxY) {	
				xScroll = window.innerWidth + window.scrollMaxX;
				yScroll = window.innerHeight + window.scrollMaxY;
			} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
				xScroll = document.body.scrollWidth;
				yScroll = document.body.scrollHeight;
			    } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
				    xScroll = document.body.offsetWidth;
				    yScroll = document.body.offsetHeight;
			    }
			var windowWidth, windowHeight;
			if (self.innerHeight) {	// all except Explorer
				if(document.documentElement.clientWidth){
					windowWidth = document.documentElement.clientWidth; 
				} else {
					windowWidth = self.innerWidth;
				}
				windowHeight = self.innerHeight;
			} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
				windowWidth = document.documentElement.clientWidth;
				windowHeight = document.documentElement.clientHeight;
			} else if (document.body) { // other Explorers
				windowWidth = document.body.clientWidth;
				windowHeight = document.body.clientHeight;
			}	
			// for small pages with total height less then height of the viewport
			if(yScroll < windowHeight){
			    var	pageHeight = windowHeight;
			} else { 
			    var	pageHeight = yScroll;
			}
			// for small pages with total width less then width of the viewport
			if(xScroll < windowWidth){	
			    var	pageWidth = windowWidth;  		
			} else {
			    var	pageWidth = xScroll;
			}
			var arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight);
			return arrayPageSize;
		},
        
		/**
		   / THIRD FUNCTION
		       * getPageScroll() by quirksmode.com
		       *
		       * @return Array Return an array with x,y page scroll values.
		       */
		getPageScroll: function() {
			var xScroll, yScroll;
			if (self.pageYOffset) {
				yScroll = self.pageYOffset;
				xScroll = self.pageXOffset;
			} else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer 6 Strict
				yScroll = document.documentElement.scrollTop;
				xScroll = document.documentElement.scrollLeft;
			} else if (document.body) {// all other Explorers
				yScroll = document.body.scrollTop;
				xScroll = document.body.scrollLeft;	
			}
			var arrayPageScroll = new Array(xScroll,yScroll);
			return arrayPageScroll;
		},

        pause: function(ms) {
			var date = new Date(); 
		    var curDate = null;
			do {  curDate = new Date(); }
			while ( curDate - date < ms);
		}
        
        
        
    });



    // from ui effects transfer
    $.fn.boxLloydLightTransfer = function(options, duration, callback){
        var o = {
			    options: options,
			duration: duration,
			callback: callback
		};

	    return this.queue(function() {
		    var elem = $(this),
			target = $(o.options.to),
			endPosition = target.offset(),
			animation = {
				    top: endPosition.top,
				left: endPosition.left,
				height: target.innerHeight(),
				width: target.innerWidth()
			},
			startPosition = elem.offset(),
			transfer = $('<div class="ui-effects-transfer"></div>')
				.appendTo(document.body)
				.addClass(o.options.className)
			    .css({
					top: startPosition.top,
					left: startPosition.left,
					height: elem.innerHeight(),
					width: elem.innerWidth(),
					position: 'absolute'
				})
				.animate(animation, o.duration, o.options.easing, function() {
					transfer.remove();
					(o.callback && o.callback.apply(elem[0], arguments));
					elem.dequeue();
				});
	    });
    };
    
	$.fn.boxLloydLight = function(options) {
        var objs = this;
        return this.each(function() {
            //   console.profile();
            new $.boxLloydLight($(this), objs, options);
            // console.profileEnd();
        });
        
    };
    
})(jQuery); 
