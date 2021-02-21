import React, { Fragment, useEffect, useReducer, useRef } from "react";
import "./World.css";
interface WorldState {
   posX: number;
   posY: number;
   heldDirections: string[];
   speed: number;
   facing: string;
   walking: string;
   pixelSize: number;
   keyDown: boolean;
   cameraLeft: number;
   cameraTop: number;
}

const directions: { [index: string]: string } = {
   UP: "up",
   DOWN: "down",
   LEFT: "left",
   RIGHT: "right",
};

const keys: { [index: string]: string } = {
   ArrowUp: directions.UP,
   ArrowLeft: directions.LEFT,
   ArrowRight: directions.RIGHT,
   ArrowDown: directions.DOWN,
};

export default function World() {
   const character = document.querySelector<HTMLElement>(".character");
   const map = document.querySelector<HTMLElement>(".map");
   const camera = useRef<HTMLDivElement>(null);
   const leftLimit: number = -8;
   const rightLimit: number = 16 * 11 + 8;
   const topLimit: number = -8 + 32;
   const bottomLimit: number = 16 * 7;

   const reducer = (
      prevState: WorldState,
      updatedProperty: Partial<WorldState>
   ): WorldState => {
      return { ...prevState, ...updatedProperty };
   };

   const initialState: WorldState = {
      posX: 0,
      posY: 0,
      heldDirections: [],
      speed: 1,
      facing: "down",
      walking: "false",
      pixelSize: 0,
      keyDown: false,
      cameraLeft: 0,
      cameraTop: 0,
   };

   const [state, dispatch] = useReducer(reducer, initialState);

   const onKeyDown = (event: React.KeyboardEvent) => {
      const heldDirections = [...state.heldDirections];
      const dir = keys[event.key];

      if (dir && heldDirections.indexOf(dir) === -1) {
         heldDirections.unshift(dir);
         dispatch({
            heldDirections,
            facing: dir,
            keyDown: true,
         });
      }

      placeCharacter();
   };

   const onKeyUp = (event: React.KeyboardEvent) => {
      const heldDirections = [...state.heldDirections];
      const dir = keys[event.key];
      const index = heldDirections.indexOf(dir);

      if (index > -1) {
         heldDirections.splice(index, 1);
         dispatch({
            heldDirections,
            keyDown: false,
         });
      }

      placeCharacter();
   };

   const getPixelSize = () => {
      const pixelSize = parseInt(
         getComputedStyle(document.documentElement).getPropertyValue("--pixel-size")
      );

      const cameraLeft = pixelSize * 66;
      const cameraTop = pixelSize * 42;

      dispatch({
         pixelSize,
         cameraLeft,
         cameraTop,
      });
   };

   const placeCharacter = () => {
      let posX = state.posX;
      let posY = state.posY;

      const held_direction = state.heldDirections[0];
      if (held_direction) {
         if (held_direction === directions.RIGHT) {
            posX = state.posX + state.speed;
         }
         if (held_direction === directions.LEFT) {
            posX = state.posX - state.speed;
         }
         if (held_direction === directions.DOWN) {
            posY = state.posY + state.speed;
         }
         if (held_direction === directions.UP) {
            posY = state.posY - state.speed;
         }
      }

      if (posX < leftLimit) {
         posX = leftLimit;
      }
      if (posX > rightLimit) {
         posX = rightLimit;
      }
      if (posY < topLimit) {
         posY = topLimit;
      }
      if (posY > bottomLimit) {
         posY = bottomLimit;
      }

      console.log("PC>>> ", held_direction, state.walking);

      dispatch({
         posX,
         posY,
         facing: held_direction || state.facing,
         walking: held_direction ? "true" : "false",
      });
   };

   const focusOnCamera = () => {
      if (null !== camera.current) {
         camera.current.focus();
      }
   };

   useEffect(() => {
      getPixelSize();
   }, [map, character]);

   useEffect(() => {
      focusOnCamera();
   });

   useEffect(() => {
      placeCharacter();
   }, [state.pixelSize]);

   useEffect(() => {
      if (map !== null) {
         map.style.transform = `translate3d( ${
            -state.posX * state.pixelSize + state.cameraLeft
         }px, ${-state.posY * state.pixelSize + state.cameraTop}px, 0 )`;
      }

      if (character !== null) {
         character.style.transform = `translate3d( ${
            state.posX * state.pixelSize
         }px, ${state.posY * state.pixelSize}px, 0 )`;
      }
   }, [state.posX, state.posY]);

   useEffect(() => {
      character?.setAttribute("data-facing", state.facing);
      character?.setAttribute("data-walking", state.walking);
   }, [state.facing, state.walking]);

   // console.log("State", state.keyDown, state.walking, state.heldDirections);

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
