/**
 *
 * CropPara class
 * <p>Usage: new Y.CropPara(document.getElementsByTagName("p")[2], {
 *      nLines      : 4,
 *      moreText    : 'Read more',
 *      lessText    : 'Read less',
 *      linkSpace   : 30
 *  });</p>
 * @class CropPara
 * @namespace YAHOO.widget.CropPara
 * @constructor
 * @param {Object/String} el (required) element to crop
 * @param {Object} oConfig
 *   {integer} nLines (required) max number of lines to crop text to
 *   {String} moreText (optional) label for 'read more' link, defaults to 'more'
 *   {String} lessText (optional) label for 'read less' link, defaults to 'less'
 *   {integer} linkSpace (optional) space alloted for inserted more/less links, defaults to 20 chars
 *   {String} ellipsis (optional) char(s) to insert after truncated text, defaults to '…'
 */


YUI.add('crop-para', function(Y){ 
    function CropPara(el, oConfig){
        this.el      = Y.get(el);
        this.oConfig = oConfig;
        this.nLines  = oConfig.nLines;
        this.init();
    }
    CropPara.NAME = 'crop-para';

    CropPara.prototype = {
        collapsed : false,
        getTextHeight : function(){
            // creates temporary element to measure the maximum required height for the truncated text container
            var o = document.createElement('i');
            // next line is for silly IEs
            o.style.lineHeight = this.el.getStyle('lineHeight');
            for(var i=0; i<this.nLines; i++){
                o.appendChild(document.createElement('br'));
                o.appendChild(document.createTextNode("M"));
            }
            this.el.appendChild(o);
            this.nHeight = o.offsetHeight * ((Y.UA.ie==6 || Y.UA.opera) ? 1.1 : 1);
            o.parentNode.removeChild(o);
        },
        init : function(){
            if(!this.el || this.el.hasClass('y-toggler')){
                return;
            }
            this.aContent = this.el.get('innerHTML').split('');
            this.el.addClass('y-toggler');
            this.getTextHeight();
            if(this.el.offsetHeight < this.nHeight){
                return;
            }
            this.toggle();
        },
        link : function(sTxt){
            this.toggler = Y.Node.create('<a href="#">' + sTxt + '</a>');
            this.toggler.on('click', this.toggle, this, true);
            this.toggler.addClass('y-toggler-' + this.collapsed);
            this.toggler.addClass('y-toggler');
            this.el.appendChild(this.toggler);
        },
        toggle : function(e){
            if(e){
                e.halt();
            }
            // the link will be removed, so remove event handler
            Y.detach('click');
            if(this.collapsed){
                // content is already truncated, restore to original
                this.el.set('innerHTML', this.aContent.join(''));
                this.link(this.oConfig.lessText || 'less');
            }else{
                var i=0, aOpenedTags=[], oSelfClosingTags={br:1, hr:1, img:1}, sClose='';
                // empty entire content
                // progressively add back in character by character until offsetHeight is maximised
                this.el.set('innerHTML', '');
                while(this.el.get('offsetHeight') < this.nHeight && i<this.aContent.length){
                    this.el.set('innerHTML', this.aContent.slice(0, i++).join(""));
                }
                // need to make space for the link to be inserted
                var a = this.aContent.slice(0, i-(this.oConfig.linkSpace || 20));
                // be careful not to leave unclosed html tags in there
                var sContent  = this.aContent.slice(0, i-(this.oConfig.linkSpace || 20)).join('');
                var matchHTML = /(\w+)(\s*[^>]*)(>)/;
                var tagMatches;
                while(sContent.indexOf('<') > -1){
                    var nIndex  = sContent.indexOf('<');
                    sContent    = sContent.substring(nIndex + 1);
                    tagMatches  = sContent.match(matchHTML);
                    if(!tagMatches){
                        // it was truncated in the middle of a tag, so clean up
                        break;
                    }
                    if(sContent.charAt(0) == '/'){
                        //closing tag
                        // remove opening tag from open tags array
                        for(var j = 0; j<aOpenedTags.length; j++){
                            if(aOpenedTags[j] == tagMatches[1]){
                                aOpenedTags.splice(j, 1);
                                break;
                            }
                        }
                    }else{    
                        // opening tag
                        // if tag needs to be closed later push into open tags array
                        if(!oSelfClosingTags[tagMatches[1]]){
                            aOpenedTags.push(tagMatches[1]);
                        }
                    }
                }
                // If there are any unclosed tags, create a string to close them all
                if(aOpenedTags.length){
                    sClose = '</' + aOpenedTags.reverse().join('></') + '>';
                }
                // ensure we only truncate on whole word boundaries
                a = a.join('').split(' ');
                a.pop();
                // dump trncated content back in
                this.el.set('innerHTML', a.join(" ") + sClose + (this.oConfig.ellipsis ||"…"));
                // add link to expand
                this.link(this.oConfig.moreText || 'more');
            }
            this.collapsed = !this.collapsed;
        }
    };
    
    Y.CropPara = CropPara;
    
}, '1.0', {requires:['node']});
