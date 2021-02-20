import React, { Fragment, useEffect, useReducer, useRef } from "react";
import "./World.css";
interface WorldState {
   posX: number;
   posY: number;
   heldDirections: string[];
   speed: number;
   facing: string;
   walking: string;
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
   UpdateFacingWalking = "UPDATE_FACING_WALKING",
}

export default function World() {
   const character = document.querySelector<HTMLElement>(".character");
   const map = document.querySelector<HTMLElement>(".map");
   const camera = useRef<HTMLDivElement>(null);

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
         case ActionType.UpdateFacingWalking: {
            let newFacing: string = state.facing;
            let newWalking: string = state.walking;

            if ("facing" in action.payload) {
               newFacing = action.payload.facing;
            }

            if ("walking" in action.payload) {
               newWalking = action.payload.walking;
            }

            return { ...state, facing: newFacing, walking: newWalking };
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
      facing: "down",
      walking: "false",
   };

   const [state, dispatch] = useReducer(reducer, initialState);

   const onKeyDown = (event: React.KeyboardEvent) => {
      const heldDirections = [...state.heldDirections];
      const dir = keys[event.key];

      if (dir && heldDirections.indexOf(dir) === -1) {
         heldDirections.unshift(dir);
         dispatch({
            type: ActionType.UpdateHeldDirections,
            payload: heldDirections,
         });
         dispatch({
            type: ActionType.UpdateFacingWalking,
            payload: {
               facing: dir,
            },
         });
      }
   };

   const onKeyUp = (event: React.KeyboardEvent) => {
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
   };

   const placeCharacter = () => {
      const pixelSize = parseInt(
         getComputedStyle(document.documentElement).getPropertyValue("--pixel-size")
      );

      const held_direction = state.heldDirections[0];
      if (held_direction) {
         if (held_direction === directions.RIGHT) {
            dispatch({
               type: ActionType.UpdateCharacterPosition,
               payload: {
                  posX: state.posX + state.speed,
               },
            });
         }
         if (held_direction === directions.LEFT) {
            dispatch({
               type: ActionType.UpdateCharacterPosition,
               payload: {
                  posX: state.posX - state.speed,
               },
            });
         }
         if (held_direction === directions.DOWN) {
            dispatch({
               type: ActionType.UpdateCharacterPosition,
               payload: {
                  posY: state.posY + state.speed,
               },
            });
         }
         if (held_direction === directions.UP) {
            dispatch({
               type: ActionType.UpdateCharacterPosition,
               payload: {
                  posY: state.posY - state.speed,
               },
            });
         }
      }

      dispatch({
         type: ActionType.UpdateFacingWalking,
         payload: {
            facing: held_direction || state.facing,
            walking: held_direction ? "true" : "false",
         },
      });

      const leftLimit = -8;
      const rightLimit = 16 * 11 + 8;
      const topLimit = -8 + 32;
      const bottomLimit = 16 * 7;

      if (state.posX < leftLimit) {
         dispatch({
            type: ActionType.UpdateCharacterPosition,
            payload: {
               posX: leftLimit,
            },
         });
      }
      if (state.posX > rightLimit) {
         dispatch({
            type: ActionType.UpdateCharacterPosition,
            payload: {
               posX: rightLimit,
            },
         });
      }
      if (state.posY < topLimit) {
         dispatch({
            type: ActionType.UpdateCharacterPosition,
            payload: {
               posY: topLimit,
            },
         });
      }
      if (state.posY > bottomLimit) {
         dispatch({
            type: ActionType.UpdateCharacterPosition,
            payload: {
               posY: bottomLimit,
            },
         });
      }

      const camera_left = pixelSize * 66;
      const camera_top = pixelSize * 42;

      if (map !== null) {
         map.style.transform = `translate3d( ${
            -state.posX * pixelSize + camera_left
         }px, ${-state.posY * pixelSize + camera_top}px, 0 )`;
      }

      if (character !== null) {
         character.style.transform = `translate3d( ${state.posX * pixelSize}px, ${
            state.posY * pixelSize
         }px, 0 )`;
      }
   };

   const focusOnCamera = () => {
      if (null !== camera.current) {
         camera.current.focus();
      }
   };

   useEffect(() => {
      focusOnCamera();
   });

   useEffect(() => {
      placeCharacter();
   }, []);

   useEffect(() => {
      placeCharacter();
   }, [state.heldDirections]);

   useEffect(() => {
      character?.setAttribute("data-facing", state.facing);
      character?.setAttribute("data-walking", state.walking);
   }, [state.facing, state.walking]);

   return (
      <Fragment>
         <div className="container" onClick={focusOnCamera}>
            <div
               className="camera"
               onKeyDown={onKeyDown}
               onKeyUp={onKeyUp}
               tabIndex={-1}
               ref={camera}
            >
               <Map />
            </div>
         </div>
      </Fragment>
   );
}

const Map = () => {
   return (
      <div className="map pixel-art">
         <Character />
      </div>
   );
};

const Character = () => {
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
