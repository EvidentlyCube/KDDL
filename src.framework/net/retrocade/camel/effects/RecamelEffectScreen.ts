import {RecamelEffect, RecamelEffectEndCallback} from "./RecamelEffect";
import {RecamelLayerSprite} from "../layers/RecamelLayerSprite";
import {RecamelDisplay} from "../core/RecamelDisplay";

export class RecamelEffectScreen extends RecamelEffect{
        /**
         * Instance of the layer used for this effect
         */
        public layer   :RecamelLayerSprite;
        
        public constructor(
        	duration:number,
	        callback:RecamelEffectEndCallback|undefined = undefined
        ){
            super(duration, callback);
            
            this.layer = RecamelLayerSprite.create();
        }
        
        protected finish(){
            RecamelDisplay.removeLayer(this.layer);
            super.finish();
        } 
    }
