import React, { useEffect, useState } from 'react';
import PokedexStyle from '../assets/css/Pokedex.module.css';
import cx from 'classnames';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import helpers from '../libs/helpers';
import pokeLoader from '../assets/gif/poke-loading.gif';

const Pokedex = () => {
  const [loading, setLoading] = useState(false);
  const [pokemon, setPokemon] = useState(null);
  const [pokemonData, setPokemonData] = useState(null);
  const [basic, setBasic] = useState(true);

  useEffect(() => {
    const getPokemon = async () => {
      const getAllPokemon = helpers.fetchPokemon('pokemon/?offset=0&limit=151');

      await getAllPokemon.then(function (resp) {
        setPokemon(resp.data.results);
      });
    };
    getPokemon();
  }, []);

  const getPokemonData = async (pokemonId) => {
    setLoading(true);

    const getPokeData = helpers.fetchPokemon(`pokemon/${pokemonId}`);
    const getPokeSpecies = helpers.fetchPokemon(`pokemon-species/${pokemonId}`);
    const getPokeMulti = helpers.fetchMultiple([getPokeData, getPokeSpecies]);

    await getPokeMulti.then(
      axios.spread((...responses) => {
        const respPokeData = responses[0].data;
        const respPokeSpecies = responses[1].data;

        const flavorTextEntry = respPokeSpecies.flavor_text_entries.findIndex((i) => {
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
        } = respPokeData;

        const flavorText = respPokeSpecies.flavor_text_entries[flavorTextEntry].flavor_text;

        setTimeout(() => {
          setLoading(false);
          setPokemonData({
            id,
            name,
            order,
            types,
            stats,
            height,
            weight,
            sprites: {
              front: front_default,
              back: back_default
            },
            flavorText
          });
        }, 1500);
      })
    );
  };

  return (
    <section className={PokedexStyle.secContainer}>
      <Container>
        <div className={PokedexStyle.pokeDexContainer}>
          <Row>
            <Col md={{ span: 6, order: 1 }} lg={{ span: 6, order: 1 }} xs={{ order: 12 }}>
              <div className={cx('cust-scroll', PokedexStyle.pokemonContainer)}>
                <Row>
                  {pokemon !== null &&
                    pokemon.map((item, index) => {
                      const { name } = item;
                      return (
                        <Col key={'pokemon-' + index} xs={6} sm={6} md={6} lg={4}>
                          <div className={PokedexStyle.pokemonWrap}>
                            <button
                              onClick={(e) => {
                                getPokemonData(index + 1);
                              }}
                            >
                              <div className={PokedexStyle.noId}>{index + 1}</div>
                              <div>{helpers.fetchSprite(index + 1)}</div>
                              <div className="text-capitalize text-black">{name}</div>
                            </button>
                          </div>
                        </Col>
                      );
                    })}
                </Row>
              </div>
            </Col>
            <Col md={{ span: 6, order: 12 }} lg={{ span: 6, order: 12 }} xs={{ order: 1 }}>
              <div className={PokedexStyle.pokemonView}>
                <Row>
                  {/*== image ==*/}
                  <Col md={12} lg={12}>
                    <div className={cx(PokedexStyle.border, PokedexStyle.imageWrap)}>
                      <Row>
                        <Col xs={10} sm={10} md={10} lg={10}>
                          <div className={PokedexStyle.imageInnerWrap}>
                            {loading ? (
                              <div>
                                <img src={pokeLoader} alt={pokeLoader} />
                              </div>
                            ) : (
                              pokemonData !== null && (
                                // console.log(pokemonData)
                                <>
                                  <img src={pokemonData.sprites.front} alt="pokemon" />
                                  <audio
                                    controls
                                    autoPlay={true}
                                    src={require(`../assets/cries/${pokemonData.id}.ogg`)}
                                    style={{ display: 'none' }}
                                  />
                                </>
                              )
                            )}
                          </div>
                        </Col>
                        <Col xs={2} sm={2} md={2} lg={2}>
                          <div className={PokedexStyle.assets}>
                            {/*== round light ==*/}
                            <div className={PokedexStyle.roundLight} />
                            {/*== round light ==*/}

                            {/*== speakers==*/}
                            <div className={PokedexStyle.speakersWrap}>
                              <div className={PokedexStyle.speakers} />
                              <div className={PokedexStyle.speakers} />
                              <div className={PokedexStyle.speakers} />
                              <div className={PokedexStyle.speakers} />
                              <div className={PokedexStyle.speakers} />
                            </div>
                            {/*== speakers==*/}
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                  {/*== image ==*/}

                  {/*== details ==*/}
                  <Col md={12} lg={12}>
                    <div className="mt-3 mb-3 flex-middle">
                      <div className="text-center fnt-10 text-white text-uppercase mr-3">
                        <button
                          onClick={() => {
                            setBasic(true);
                          }}
                          className="btn-select-style mb-1"
                        />
                        <div>Info</div>
                      </div>
                      <div className="text-center fnt-10 text-white text-uppercase mr-3">
                        <button
                          onClick={() => {
                            setBasic(false);
                          }}
                          className="btn-select-style mb-1"
                        />
                        <div>Stats</div>
                      </div>
                    </div>
                    <div className={cx('cust-scroll', PokedexStyle.detailsWrap)}>
                      {/*== name, order, flavor text ==*/}
                      <div>
                        {loading ? (
                          <div className="text-center">
                            <img src={pokeLoader} alt={pokeLoader} style={{ maxWidth: 150, marginTop: 15 }} />
                          </div>
                        ) : (
                          pokemonData !== null && (
                            <>
                              {/*== name, no. ==*/}
                              {basic ? (
                                <>
                                  <Row className="mt-2 mb-2">
                                    <Col xs={12} sm={12} md={6} lg={6}>
                                      <div className={cx('mr-1 text-capitalize', PokedexStyle.nameDet)}>
                                        <span className="mr-2 d-inline-block">{pokemonData.name}</span>
                                        <span>#{pokemonData.id}</span>
                                      </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={6}>
                                      <div className="flex-middle">
                                        {Object.values(pokemonData.types).map((item, index) => {
                                          return (
                                            <div key={'types-' + index} className={cx('type mr-1', item.type.name)}>
                                              {item.type.name}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </Col>
                                  </Row>

                                  {/*== height, width==*/}
                                  <Row className="mt-2 mb-2">
                                    <Col xs={12} sm={12} md={6} lg={6}>
                                      <div className="flex-middle mr-1">
                                        <span className="mr-1">Height:</span>
                                        <span>{pokemonData.height}m</span>
                                      </div>
                                    </Col>
                                    <Col xs={12} sm={12} md={6} lg={6}>
                                      <div className="flex-middle mr-1">
                                        <span className="mr-1">Weight:</span>
                                        <span>{pokemonData.weight}kg</span>
                                      </div>
                                    </Col>
                                  </Row>

                                  {/*== flavor text ==*/}
                                  <Row className="mt-2 mb-2">
                                    <Col>{pokemonData.flavorText}</Col>
                                  </Row>
                                </>
                              ) : (
                                <>
                                  {Object.values(pokemonData.stats).map((item, index) => {
                                    let baseStat = (item.base_stat / 200) * 100;
                                    return (
                                      <div key={'stats-' + index} className="flex-middle text-capitalize mt-2 mb-2">
                                        <div className="w-50">{item.stat.name}</div>
                                        <div className="w-50">
                                          <div className={PokedexStyle.statsWrap}>
                                            <div
                                              className={cx(PokedexStyle.stats, item.stat.name)}
                                              style={{
                                                width: `${baseStat}%`
                                              }}
                                            >
                                              {baseStat.toFixed(0)}%
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </>
                              )}
                            </>
                          )
                        )}
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
};

export default Pokedex;
