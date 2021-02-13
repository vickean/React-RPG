import React, { useEffect, useReducer } from "react";
import "./World.css";

interface CharacterProps {
   facing: string;
   walking: boolean;
}

interface WorldState {
   posX: number;
   posY: number;
   heldDirections: string[];
   speed: number;
}

interface Action {
   type: string;
   payload: any;
}

enum directions {
   UP = "up",
   DOWN = "down",
   LEFT = "left",
   RIGHT = "right",
}

const keys: { 38: string; 37: string; 39: string; 40: string } = {
   38: directions.UP,
   37: directions.LEFT,
   39: directions.RIGHT,
   40: directions.DOWN,
};

enum ActionType {
   UpdateCharacterPosition = "UPDATE_CHARACTER_POSITION",
   UpdateHeldDirections = "UPDATE_HELD_DIRECTIONS",
}

export default function World() {
   const reducer = (state: WorldState, action: Action): WorldState => {
      switch (action.type) {
         case ActionType.UpdateCharacterPosition: {
            let newPosX: number = state.posX;
            let newPosY: number = state.posY;

            if ("posX" in action.payload) {
               newPosX = action.payload.posX;
            }

            if ("posY" in action.payload) {
               newPosY = action.payload.posY;
            }

            return { ...state, posX: newPosX, posY: newPosY };
         }
         case ActionType.UpdateHeldDirections: {
            return state;
         }
         default:
            return state;
      }
   };

   const initialState: WorldState = {
      posX: 0,
      posY: 0,
      heldDirections: [],
      speed: 1,
   };

   const [state, dispatch] = useReducer(reducer, initialState);

   useEffect(() => {
      document.addEventListener("keydown", (e) => {
         console.log("KEYDN>>> ", e);
      });

      document.addEventListener("keyup", (e) => {
         console.log("KEYUP>>> ", e);
      });
   }, []);

   return (
      <div className="camera">
         <Map />
      </div>
   );
}

const Map = () => {
   return (
      <div className="map pixel-art">
         <Character facing="down" walking={true} />
      </div>
   );
};

const Character = (props: CharacterProps) => {
   const { facing, walking } = props;

   return (
      <div className="character">
         <CharacterShadow />
         <CharacterSpritesheet />
      </div>
   );
};

const CharacterShadow = () => {
   return <div className="shadow pixel-art" />;
};

const CharacterSpritesheet = () => {
   return <div className="character_spritesheet pixel-art" />;
};
