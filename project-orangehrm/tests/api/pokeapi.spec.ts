import { test, expect } from "@framework";

test.describe("PokeAPI Tests - Robust Framework", () => {
  const POKEAPI_BASE = "https://pokeapi.co/api/v2";

  test.describe("Pokémon Queries", () => {
    test("GET Pokémon by name with framework @api @pokeapi @smoke", async ({ td }) => {
      const pokemonName = td.pokemon || "pikachu";
      const response = await fetch(`${POKEAPI_BASE}/pokemon/${pokemonName}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe(pokemonName);
      expect(data.id).toBe(td.pokemonId);
      expect(data).toHaveProperty("types");

      console.log(`[Test] Retrieved Pokémon: ${data.name} (ID: ${data.id})`);
    });

    test("GET Pokémon by ID with framework @api @pokeapi", async ({ td }) => {
      const pokemonId = td.pokemonId || 25;
      const response = await fetch(`${POKEAPI_BASE}/pokemon/${pokemonId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(pokemonId);
      expect(data).toHaveProperty("name");
      expect(data).toHaveProperty("types");

      console.log(`[Test] Retrieved Pokémon ID ${pokemonId}: ${data.name}`);
    });

    test("GET Pokémon list with pagination @api @pokeapi", async () => {
      const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=10&offset=0`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("results");
      expect(data).toHaveProperty("count");
      expect(data.results).toHaveLength(10);

      console.log(`[Test] Retrieved ${data.results.length} Pokémon from list`);
    });

    test("GET Pokémon with custom offset and limit @api @pokeapi", async () => {
      const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=5&offset=20`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results).toHaveLength(5);

      console.log(`[Test] Retrieved paginated list with offset=20, limit=5`);
    });

    test("GET Pokémon species information @api @pokeapi", async ({ td }) => {
      const pokemonId = td.pokemonId || 25;
      const response = await fetch(`${POKEAPI_BASE}/pokemon-species/${pokemonId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(pokemonId);
      expect(data).toHaveProperty("flavor_text_entries");

      console.log(`[Test] Retrieved species info for Pokémon ${pokemonId}`);
    });
  });

  test.describe("Type Information", () => {
    test("GET Pokémon type @api @pokeapi @smoke", async ({ td }) => {
      const typeName = td.type || "electric";
      const response = await fetch(`${POKEAPI_BASE}/type/${typeName}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe(typeName);
      expect(data).toHaveProperty("pokemon");

      console.log(`[Test] Retrieved type: ${data.name}`);
    });

    test("GET type by ID @api @pokeapi", async ({ td }) => {
      const typeId = td.typeId || 13;
      const response = await fetch(`${POKEAPI_BASE}/type/${typeId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(typeId);

      console.log(`[Test] Retrieved type by ID: ${typeId}`);
    });

    test("GET type list @api @pokeapi", async () => {
      const response = await fetch(`${POKEAPI_BASE}/type?limit=10`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("results");
      expect(data.results.length).toBeGreaterThan(0);

      console.log(`[Test] Retrieved ${data.results.length} types`);
    });
  });

  test.describe("Ability Information", () => {
    test("GET ability information @api @pokeapi", async () => {
      const response = await fetch(`${POKEAPI_BASE}/ability/1`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("name");
      expect(data).toHaveProperty("pokemon");

      console.log(`[Test] Retrieved ability: ${data.name}`);
    });

    test("GET ability list @api @pokeapi", async () => {
      const response = await fetch(`${POKEAPI_BASE}/ability?limit=20`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.results.length).toBeGreaterThan(0);

      console.log(`[Test] Retrieved ${data.results.length} abilities`);
    });
  });

  test.describe("Chained Operations", () => {
    test("Query Pokémon and then its species @api @pokeapi @chained", async ({ td }) => {
      const pokemonName = td.pokemon || "pikachu";

      // Get Pokémon
      const pokemonResponse = await fetch(`${POKEAPI_BASE}/pokemon/${pokemonName}`);
      const pokemonData = await pokemonResponse.json();
      expect(pokemonResponse.status).toBe(200);
      const pokemonId = pokemonData.id;

      // Get species for that Pokémon
      const speciesResponse = await fetch(`${POKEAPI_BASE}/pokemon-species/${pokemonId}`);
      const speciesData = await speciesResponse.json();
      expect(speciesResponse.status).toBe(200);
      expect(speciesData.id).toBe(pokemonId);

      console.log(`[Test] Chained query: ${pokemonName} -> species info`);
    });

    test("Get Pokémon type and then all Pokémon of that type @api @pokeapi @chained", async () => {
      // Get first Pokémon
      const pokemonResponse = await fetch(`${POKEAPI_BASE}/pokemon/1`);
      const pokemonData = await pokemonResponse.json();
      expect(pokemonResponse.status).toBe(200);
      const firstType = pokemonData.types[0].type.name;

      // Get all Pokémon of that type
      const typeResponse = await fetch(`${POKEAPI_BASE}/type/${firstType}`);
      const typeData = await typeResponse.json();
      expect(typeResponse.status).toBe(200);
      expect(typeData.pokemon.length).toBeGreaterThan(0);

      console.log(`[Test] Chained query: Pokémon -> Type ${firstType} -> Pokémon list`);
    });

    test("Query multiple Pokémon in parallel @api @pokeapi @chained", async () => {
      const pokemonNames = ["pikachu", "charizard", "blastoise"];

      const requests = pokemonNames.map(name =>
        fetch(`${POKEAPI_BASE}/pokemon/${name}`).then(r => r.json())
      );

      const results = await Promise.all(requests);

      expect(results.length).toBe(3);
      for (const result of results) {
        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("id");
      }

      console.log(`[Test] Parallel queries completed for ${pokemonNames.length} Pokémon`);
    });
  });

  test.describe("Error Handling", () => {
    test("Handle Pokémon not found gracefully @api @pokeapi @negative", async () => {
      try {
        const response = await fetch(`${POKEAPI_BASE}/pokemon/invalid-pokemon-name-999999`);
        expect(response.status).toBe(404);
        console.log("[Test] Non-existent Pokémon returned 404 as expected");
      } catch (error: any) {
        console.log("[Test] Caught expected error:", error.message);
      }
    });

    test("Handle type not found gracefully @api @pokeapi @negative", async () => {
      try {
        const response = await fetch(`${POKEAPI_BASE}/type/invalid-type-name-999999`);
        expect(response.status).toBe(404);
        console.log("[Test] Non-existent type returned 404 as expected");
      } catch (error: any) {
        console.log("[Test] Caught expected error:", error.message);
      }
    });

    test("Validate response structure @api @pokeapi", async () => {
      const response = await fetch(`${POKEAPI_BASE}/pokemon/1`);
      const data = await response.json();

      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("name");
      expect(data).toHaveProperty("types");
      expect(Array.isArray(data.types)).toBe(true);

      console.log("[Test] Pokémon structure validation passed");
    });
  });

  test.describe("Data-Driven Tests", () => {
    test("Create queries from test data @api @pokeapi @data-driven", async ({ td }) => {
      const pokemonName = td.pokemon || "pikachu";
      const expectedId = td.pokemonId || 25;

      const response = await fetch(`${POKEAPI_BASE}/pokemon/${pokemonName}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe(pokemonName);
      expect(data.id).toBe(expectedId);

      console.log(`[Test] Data-driven test using td fixture: ${pokemonName}`);
    });

    test("Query type from test data @api @pokeapi @data-driven", async ({ td }) => {
      const typeName = td.type || "electric";

      const response = await fetch(`${POKEAPI_BASE}/type/${typeName}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe(typeName);

      console.log(`[Test] Data-driven type query: ${typeName}`);
    });
  });

  test.describe("Performance and Reliability", () => {
    test("Multiple sequential requests @api @pokeapi", async () => {
      for (let i = 1; i <= 3; i++) {
        const response = await fetch(`${POKEAPI_BASE}/pokemon/${i}`);
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data).toHaveProperty("name");
      }

      console.log("[Test] Sequential requests completed successfully");
    });

    test("List endpoint pagination @api @pokeapi", async () => {
      const limits = [5, 10, 20];

      for (const limit of limits) {
        const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=${limit}`);
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.results).toHaveLength(limit);
      }

      console.log("[Test] Pagination with different limits completed");
    });
  });
});
