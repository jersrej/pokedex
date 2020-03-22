import React, { useEffect, useState } from 'react';
import PokemonStyle from '../assets/css/Pokemon.module.css';
import cx from 'classnames';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import helpers from '../libs/helpers';
import pokeLoader from '../assets/gif/poke-loading.gif';
import test from '../assets/cries/1.ogg';

function Pokedex() {
    const [loading, setLoading] = useState(false);
    const [pokemon, setPokemon] = useState(null);
    const [pokemonData, setPokemonData] = useState(null);

    useEffect(() => {
        const getPokemon = async () => {
            const getAllPokemon = helpers.fetchPokemon('pokemon/?offset=0&limit=150');

            await getAllPokemon.then(function (resp) {
                setPokemon(resp.data.results)
            })
        }
        getPokemon();
    }, []);

    const getPokemonData = async (pokemonId) => {

        setLoading(true);

        const getPokeData = helpers.fetchPokemon(`pokemon/${pokemonId}`);
        const getPokeSpecies = helpers.fetchPokemon(`pokemon-species/${pokemonId}`);
        const getPokeMulti = helpers.fetchMultiple([getPokeData, getPokeSpecies]);

        await getPokeMulti.then(axios.spread((...responses) => {
            const respPokeData = responses[0].data;
            const respPokeSpecies = responses[1].data;

            const flavorTextEntry = respPokeSpecies.flavor_text_entries.findIndex(i => {
                return i.language.name === 'en' && i.version.name === 'firered';
            });

            const {
                id,
                name,
                order,
                types,
                stats,
                height,
                weight,
                sprites: { back_default, front_default }
            } = respPokeData

            let flavorText = respPokeSpecies.flavor_text_entries[flavorTextEntry].flavor_text;

            setTimeout(() => {
                setLoading(false);
                setPokemonData({
                    'id': id,
                    'name': name,
                    'order': order,
                    'types': types,
                    'stats': stats,
                    'height': height,
                    'weight': weight,
                    'sprites': {
                        'front': front_default,
                        'back': back_default
                    },
                    'flavorText': flavorText
                });
            }, 1500);
        }))
    }

    // const memoizedJOKER = useMemo(() =>
    //     pokemonData, [pokemonData]);

    return (
        <section className={PokemonStyle.secContainer}>
            <Container>
                <div className={PokemonStyle.pokeDexContainer}>
                    <Row>
                        <Col md={6} lg={6}>
                            <div className={cx("cust-scroll", PokemonStyle.pokemonContainer)}>
                                <Row>
                                    {
                                        pokemon !== null &&
                                        pokemon.map((item, index) => {
                                            const { name } = item
                                            return (
                                                <Col
                                                    key={"pokemon-" + index}
                                                    xs={6}
                                                    sm={6}
                                                    md={6}
                                                    lg={4}
                                                >
                                                    <div className={PokemonStyle.pokemonWrap}>
                                                        <button
                                                            onClick={(e) => {
                                                                getPokemonData(index + 1);
                                                            }}
                                                        >
                                                            <div className={PokemonStyle.noId}>{index + 1}</div>
                                                            {helpers.fetchSprite(index + 1)}
                                                            <div className="text-capitalize text-black">
                                                                {name}
                                                            </div>
                                                        </button>
                                                    </div>
                                                </Col>
                                            )
                                        })
                                    }
                                </Row>
                            </div>
                        </Col>
                        <Col md={6} lg={6}>
                            <div className={PokemonStyle.pokemonView}>
                                <Row>
                                    {/*== image ==*/}
                                    <Col md={12} lg={12}>
                                        <div className={cx(PokemonStyle.border, PokemonStyle.imageWrap)}>
                                            <div className={PokemonStyle.imageInnerWrap}>
                                                {
                                                    loading ?
                                                        (
                                                            <div>
                                                                <img src={pokeLoader} alt={pokeLoader} />
                                                            </div>
                                                        )
                                                        : (
                                                            pokemonData !== null &&
                                                            // console.log(pokemonData)
                                                            <>
                                                                <img src={pokemonData.sprites.front} alt="pokemon" />
                                                                <audio controls autoPlay={true} src={require(`../assets/cries/${pokemonData.id}.ogg`)} style={{ display: 'none' }} />
                                                            </>
                                                        )
                                                }
                                            </div>
                                        </div>
                                    </Col>
                                    {/*== image ==*/}

                                    {/*== details ==*/}
                                    <Col md={12} lg={12}>
                                        <div className={PokemonStyle.detailsWrap}>
                                            {/*== name, order, flavor text ==*/}
                                            <div>
                                                {
                                                    loading ? (
                                                        <div className="text-center">
                                                            <img src={pokeLoader} alt={pokeLoader} style={{ maxWidth: 160 }} />
                                                        </div>
                                                    ) : (
                                                            pokemonData !== null &&
                                                            <>
                                                                {/*== name, no. ==*/}
                                                                <div className="flex-middle mt-1 mb-1">
                                                                    <div className="mr-1 text-capitalize">
                                                                        <span className="mr-2 d-inline-block">
                                                                            {pokemonData.name}
                                                                        </span>
                                                                        <span>
                                                                            #{pokemonData.id}
                                                                        </span>
                                                                    </div>
                                                                    <div className="ml-1 flex-middle">
                                                                        {
                                                                            Object.values(pokemonData.types).map((item, index) => {
                                                                                return (
                                                                                    <div
                                                                                        key={"types-" + index}
                                                                                        className={cx("type", item.type.name)}
                                                                                    >
                                                                                        {item.type.name}
                                                                                    </div>
                                                                                )
                                                                            })
                                                                        }
                                                                    </div>
                                                                </div>

                                                                {/*== height, width==*/}
                                                                <div className="mt-1 mb-1 flex-middle">
                                                                    <div className="flex-middle mr-1">
                                                                        <span className="mr-1">Height:</span>
                                                                        <span>{pokemonData.height}m</span>
                                                                    </div>
                                                                    <div className="flex-middle ml-1">
                                                                        <span className="mr-1">Weight:</span>
                                                                        <span>{pokemonData.weight}kg</span>
                                                                    </div>
                                                                </div>

                                                                {/*== flavor text ==*/}
                                                                <div className="mt-1 mb-1">
                                                                    {pokemonData.flavorText}
                                                                </div>
                                                            </>
                                                        )
                                                }
                                            </div>
                                        </div>
                                    </Col>
                                    {/*== details ==*/}
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Container>
        </section>
    );
}

export default Pokedex;
