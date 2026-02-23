import { BaseAPIClient } from "./BaseAPIClient";

/**
 * PokeAPI Client
 * Provides methods for testing against the Pokémon API
 * PokeAPI: https://pokeapi.co
 */
export class PokeAPIClient extends BaseAPIClient {
  constructor() {
    super("https://pokeapi.co/api/v2");
  }

  /**
   * Get Pokémon by name or ID
   */
  async getPokemon(nameOrId: string | number): Promise<any> {
    console.log(`[API:PokeAPI] Getting Pokémon: ${nameOrId}`);
    return await this.get(`/pokemon/${nameOrId}`);
  }

  /**
   * Get list of Pokémon
   */
  async getPokemonList(limit: number = 20, offset: number = 0): Promise<any> {
    console.log(`[API:PokeAPI] Getting Pokémon list (limit=${limit}, offset=${offset})`);
    return await this.get("/pokemon", { limit, offset });
  }

  /**
   * Get Pokémon species information
   */
  async getPokemonSpecies(id: number): Promise<any> {
    console.log(`[API:PokeAPI] Getting Pokémon species: ${id}`);
    return await this.get(`/pokemon-species/${id}`);
  }

  /**
   * Get Pokémon type information
   */
  async getType(nameOrId: string | number): Promise<any> {
    console.log(`[API:PokeAPI] Getting type: ${nameOrId}`);
    return await this.get(`/type/${nameOrId}`);
  }

  /**
   * Get ability information
   */
  async getAbility(nameOrId: string | number): Promise<any> {
    console.log(`[API:PokeAPI] Getting ability: ${nameOrId}`);
    return await this.get(`/ability/${nameOrId}`);
  }

  /**
   * Get move information
   */
  async getMove(nameOrId: string | number): Promise<any> {
    console.log(`[API:PokeAPI] Getting move: ${nameOrId}`);
    return await this.get(`/move/${nameOrId}`);
  }

  /**
   * Get generation information
   */
  async getGeneration(id: number): Promise<any> {
    console.log(`[API:PokeAPI] Getting generation: ${id}`);
    return await this.get(`/generation/${id}`);
  }
}
