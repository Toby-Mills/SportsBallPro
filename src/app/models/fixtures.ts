import { Fixture } from './match';
import { FixturesAPI } from './web-sports';

/**
 * Internal model for a collection of fixtures.
 * Transforms from FixturesAPI (raw API response) to array of internal Fixture models.
 */
export class Fixtures {
    fixtures: Fixture[] = [];
    
    /**
     * Load and transform from API model
     */
    public loadFromAPI(input: FixturesAPI): void {
        this.fixtures = [];
        for (let apiFixture of input.fixtures) {
            const fixture = new Fixture();
            fixture.loadFromAPI(apiFixture);
            this.fixtures.push(fixture);
        }
    }
}
