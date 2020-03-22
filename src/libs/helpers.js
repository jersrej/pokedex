import React from "react";
import axios from 'axios';
import constants from './constants';

const helpers = {
    fetchPokemon: function (apiMethod) {
        try {
            const pokemon = axios(`${constants.poke_api}${apiMethod}`);

            return pokemon;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    fetchMultiple: function (methodArr = []) {
        try {
            const pokemon = axios.all(methodArr)

            return pokemon;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    fetchSprite: function (pokeId) {
        return <img src={constants.poke_api_sprites + pokeId + '.png'} alt="Pokemon" />;
    }
};

export default helpers;
