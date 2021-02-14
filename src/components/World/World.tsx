import React, { Fragment, useCallback, useEffect, useReducer } from "react";
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

const keys: { [index: string]: string } = {
   ArrowUp: directions.UP,
   ArrowLeft: directions.LEFT,
   ArrowRight: directions.RIGHT,
   ArrowDown: directions.DOWN,
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
            return { ...state, heldDirections: action.payload };
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

   const onKeyDown = useCallback((event: KeyboardEvent) => {
      const heldDirections = [...state.heldDirections];
      const dir = keys[event.key];

      if (dir && heldDirections.indexOf(dir) === -1) {
         heldDirections.unshift(dir);
         dispatch({
            type: ActionType.UpdateHeldDirections,
            payload: heldDirections,
         });
      }
   }, []);

   const onKeyUp = useCallback((event: KeyboardEvent) => {
      const heldDirections = [...state.heldDirections];
      const dir = keys[event.key];
      const index = heldDirections.indexOf(dir);

      if (index > -1) {
         heldDirections.splice(index, 1);
         dispatch({
            type: ActionType.UpdateHeldDirections,
            payload: heldDirections,
         });
      }
   }, []);

   const placeCharacter = () => {
      const pixelSize = parseInt(
         getComputedStyle(document.documentElement).getPropertyValue("--pixel-size")
      );
      console.log("PIXELSIZE>>> ", pixelSize);
   };

   useEffect(() => {
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
   }, []);

   useEffect(() => {
      placeCharacter();
   });

   return (
      <Fragment>
         <div className="camera">
            <Map />
         </div>
      </Fragment>
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
