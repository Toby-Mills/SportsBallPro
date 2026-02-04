# SportsBallPro - Application Architecture Documentation

## Functional Description

### Overview
SportsBallPro is a real-time cricket match tracking and statistics application built with Angular. It provides comprehensive viewing of live cricket matches, detailed scorecards, player statistics, and historical match data by consuming the WebSports.co.za API. The application is designed to be responsive and mobile-friendly, with a focus on providing cricket fans with an intuitive interface to follow matches and analyze player performance.

### Key Features

#### 1. Match Viewing and Tracking
- **Live Match Monitoring**: Users can view real-time updates of cricket matches including scores, current batters, current bowlers, and recent balls
- **Watch List System**: Users can track up to 10 matches simultaneously in a personalized watch list, with matches organized by area (Wynberg, Main, or Rondebosch)
- **Auto-Refresh**: Automatic data refresh with configurable timer (default 30 seconds) to keep match information current
- **Match Details**: Comprehensive match information including:
  - Team scores with runs, wickets, overs, and run rate
  - Current batters at the crease with runs, balls faced, fours, and sixes
  - Current bowlers with overs, wickets, and economy rate
  - Recent balls 
  - Fall of wickets progression
  - Full batting and bowling scorecards
  - Run comparison charts between teams
  - Wagon wheel visualizations for player shot placement
  - Ball-by-ball commentary
  - Handle matches with multiple innings (up to 2 innings per team)
  - Innings Selection: Toggle between different innings views in a match

#### 2. Fixture Search and Discovery
- **Team Search**: Search for fixtures by team name across the WebSports database
- **Club-Specific Views**: Dedicated fixture pages for specific clubs (Wynberg BHS, Rondebosch)
- **Fixture Filtering**: Filter fixtures by date (show only past matches or include future fixtures)
- **Match Keys**: Encrypted match identifiers for sharing and bookmarking specific matches

#### 3. Player Statistics and Analysis
- **Player Aggregation**: Combine statistics across multiple matches for selected players
- **Batting Statistics**: Track runs, balls faced, fours, sixes, 50s, 100s, and times out
- **Bowling Statistics**: Monitor wickets, runs conceded, balls bowled, no-balls, and wides
- **Year-Based Filtering**: Filter player statistics by specific seasons/years
- **Multi-Fixture Analysis**: Select multiple fixtures to aggregate player performance across games
- **Team-Specific Stats**: View statistics for players from a selected team
- **Dedicated Views**: Special stats containers for Wynberg BHS and general stats pages

#### 4. Responsive Design and Mobile Experience
- **Mobile-First Design**: Optimized layouts for mobile devices
- **Touch-Friendly Navigation**: Swipe and tap interactions for mobile users
- **Responsive Grids**: Adaptive layouts based on screen size

### Target Users
- Cricket fans following local South African school and club cricket
- Parents and families of players wanting to track matches remotely
- Cricket coaches and team managers analyzing player and team performance
- Schools and clubs (particularly Wynberg BHS) tracking their teams

### Deployment
- Hosted on GitHub Pages at https://toby-mills.github.io/SportsBallPro/
- Static site generation with Angular's production build
- Configured for GitHub Pages deployment with automated build scripts

---

## High-Level Code Architecture

### Technology Stack
- **Framework**: Angular (standalone components architecture)
- **Language**: TypeScript
- **HTTP Client**: Angular HttpClient with custom error interceptor
- **Charts**: ng2-charts (Chart.js wrapper) for data visualization
- **Crypto**: crypto-js for match key encryption/decryption
- **Testing**: Jasmine + Karma for unit tests
- **Build**: Angular CLI with production optimizations

### Application Structure

#### Core Application Files
- **main.ts**: Application bootstrap entry point
- **app.component.ts**: Root component with global toaster notifications
- **app.config.ts**: Application configuration with providers (routing, HTTP client, charts, error interceptor)
- **app.routes.ts**: Main routing configuration

### Architecture Layers

#### 1. Routing and Navigation (`app.routes.ts`)

The application uses Angular Router with a multi-area architecture supporting three main areas:
- **Main Area** (`/main/*`): General cricket match tracking
- **Wynberg Area** (`/wynberg/*`): Dedicated space for Wynberg BHS cricket
- **Rondebosch Area** (`/rondebosch/*`): Dedicated space for Rondebosch BHS

Each area has consistent sub-routes:
- `/matches`: view of all matches currently being watched by the user
- `/fixtures`: Search and browse fixtures
- `/stats`: Player statistics and analysis
- `/match/:id`: Individual match details (encrypted ID)

**Layout System**:
- `AppLayoutComponent`: Full layout with navigation header for main views
- `MinimalLayoutComponent`: Minimal layout for watching a single match intended for viewing a matched shared by URL

#### 2. Services Layer

**Core Services**:

- **WebSportsAPIService** (`web-sports-api.service.ts`)
  - Direct interface to WebSports.co.za REST API
  - Methods for all API endpoints (fixtures, batting/bowling scorecards, commentary, wagon wheel, etc.)
  - Type-safe Observable-based responses
  - Handles URL encoding and parameter construction

- **MatchService** (`match.service.ts`)
  - Central state management for multiple matches
  - Uses Map-based storage with BehaviorSubjects for reactive updates
  - Manages match data with compound keys (gameId, innings, team)
  - Provides Observable streams for components to subscribe to:
    - Fixture updates
    - Status updates
    - Team scores (innings-aware)
    - Batting/bowling scorecards
    - Recent balls/overs
    - Fall of wickets
    - Ball-by-ball commentary
    - Player lineups
    - Run comparison
    - Wagon wheel data
  - Polling mechanisms for live match updates
  - Handles data transformation from API models to internal models

- **WatchListService** (`watch-list.service.ts`)
  - Manages user's watched matches (up to 10 per area)
  - LocalStorage persistence
  - Separate watch lists for each area (Wynberg, Main, etc.)
  - Validation to prevent invalid gameIds
  - Observable notifications for watch list changes

- **PlayerAggregationService** (`player-aggregation.service.ts`)
  - Aggregates player statistics across multiple fixtures
  - Uses RxJS forkJoin for parallel API calls
  - Calculates batting and bowling statistics for all of the players in a team

- **MatchKeyService** (`match-key.service.ts`)
  - Encrypts/decrypts match IDs using AES encryption
  - Generates shareable URLs for specific matches
  - Uses crypto-js for cryptographic operations

- **FixtureSearchService** (`fixture-search.service.ts`)
  - Cached fixture search functionality
  - Reduces redundant API calls
  - Implements search-term-based caching strategy

- **FixtureDetailsService** (`fixture-details.service.ts`)
  - Loads detailed fixture information
  - Manages fixture metadata and details
  - Manages a cache to prevent unnecessary API calls

- **StatsStateService** (`stats-state.service.ts`)
  - Preserves user's stats page state when navigating
  - Allows returning to stats page with same filters/selections

- **ToasterMessageService** (`toaster-message.service.ts`)
  - Global notification system
  - Displays success/error/info messages to users
  - Used for error handling and user feedback

#### 3. Models and Data Types

**Core Models** (`src/app/models/`):

- **Match Models** (`match.ts`):
  - `Match`: Central match data structure with fixture, status, scores, innings
  - `Fixture`: Basic fixture information (teams, venue, date)
  - `Status`: Match status (toss, result, runs required)
  - `Innings`: Innings details. Each innings contains 2 BattingInnings (one for each team)

- **WebSports API Models** (`web-sports.ts`):
  - Direct mappings to API response structures

- **Transformed Models**:
  - `TeamScore` (`team-score.ts`): Processed team scoring data
  - `BattingInningsDetail` (`batting-innings-detail.ts`): Detailed innings information
  - `RecentBalls` (`recent-balls.ts`): Recent ball-by-ball data
  - `BallByBallCommentary` (`ball-commentary.ts`): Structured commentary data
  - `FixtureSummary` (`fixture-summary.ts`): Summarized fixture information

- **API Response** (`api-response.ts`):
  - Error response type guards
  - Handles WebSports API error format

#### 4. Components

**Layout Components**:
- `AppLayoutComponent`: Main navigation header with area-specific routing
- `MinimalLayoutComponent`: Bare-bones layout for focused match viewing

**Page Components**:
- `MatchDetailsComponent`: Full match detail view with all scorecards and stats
- `MatchListComponent`: Carousel/grid view of watched matches with auto-refresh
- `FixturesComponent`: General fixture search and browse
- `ClubFixturesComponent`: Club-specific fixture listing with home/away grouping
- `StatsComponent`: Player statistics selection and display
- `StatsContainerComponent`: Container for stats with team search
- `WynbergStatsContainerComponent`: Wynberg-specific stats wrapper

**Match Detail Sub-Components**:
- `TeamScoreComponent`: Team score display with runs, wickets, overs, run rate
- `BattingScorecardComponent`: Detailed batting scorecard table
- `BowlingScorecardComponent`: Detailed bowling scorecard table
- `CurrentBattersComponent`: Live display of batters at crease
- `CurrentBowlersComponent`: Live display of current bowlers
- `RecentBallsComponent`: Recent balls/overs with color-coded ball outcomes
- `FallOfWicketsComponent`: Wickets timeline
- `RunComparisonComponent`: Chart comparing run rates between teams
- `WagonWheelComponent`: Shot placement visualization
- `BallByBallCommentaryComponent`: Over-by-over commentary display
- `OverCommentaryComponent`: Individual over details

**Utility Components**:
- `FixtureSelectorComponent`: Checkbox selector for multiple fixtures
- `TeamSearchComponent`: Team name search input
- `YearFilterComponent`: Year filtering dropdown
- `PlayerStatsTableComponent`: Table display for aggregated player stats
- `RefreshTimerComponent`: Countdown timer for auto-refresh
- `ToasterComponent`: Global toast notifications
- `ModalDialogComponent`: Reusable modal overlay

**Navigation Components**:
- `MatchRedirectComponent`: Decrypts match keys and redirects to match detail

#### 5. Pipes (Data Transformation)

- `GroupFixturesPipe`: Groups fixtures by date
- `SortFixturesPipe`: Sorts fixtures by date and time
- `SortFixturesByTeamPipe`: Sorts fixtures with selected team first
- `HomeTeamPipe`: Extracts home team from fixture
- `OpponentTeamPipe`: Determines opponent team based on selected team

#### 6. Interceptors

- **ApiErrorInterceptor** (`api-error.interceptor.ts`):
  - HTTP interceptor that checks for API errors in successful responses
  - WebSports API returns 200 OK even for errors, so this converts them to proper HTTP errors
  - Integrates with Angular's error handling pipeline
  - Uses type guards to detect API error responses

#### 7. State Management Pattern

The application uses a **reactive state management** pattern:

1. **Service-Based State**: Services (primarily `MatchService`) maintain state using `BehaviorSubject`s
2. **Observable Streams**: Components subscribe to observables for reactive updates
3. **Map-Based Storage**: Multiple matches stored in Maps with compound keys for efficient lookups
4. **Polling**: Services poll APIs at intervals for live data updates
5. **LocalStorage**: Watch list persisted to browser storage for user convenience
6. **Caching**: Search results cached to minimize API calls

### Data Flow

```
User Action (Component)
    ↓
Service Method Call
    ↓
WebSportsAPIService.http.get()
    ↓
API Error Interceptor (check for errors)
    ↓
Observable Response
    ↓
Service Transforms Data (API models → Internal models)
    ↓
BehaviorSubject.next() (update state)
    ↓
Component Observables Receive Update
    ↓
View Updates (via Angular change detection)
```

### Key Design Patterns

1. **Standalone Components**: All components use Angular's standalone architecture (no NgModules)
2. **Dependency Injection**: Services injected via constructor with `providedIn: 'root'`
3. **Reactive Programming**: Heavy use of RxJS Observables for asynchronous data streams
4. **Observer Pattern**: BehaviorSubjects for state management with multiple subscribers
5. **Factory Pattern**: Model classes have factory methods for data transformation
6. **Compound Keys**: Unique identifiers combining multiple parameters (gameId-innings-team)
7. **Lazy Loading**: Components loaded on-demand through routing
8. **Caching**: Strategic caching of search results and fixture data
9. **Error Boundaries**: Global error handling through interceptor and toaster service

### Build and Deployment

**Build Process**:
1. `npm run build`: Angular production build
2. Output to `docs/` directory (GitHub Pages standard)
3. `move-build.js`: Post-build script to organize files
4. Creates `404.html` from `index.html` for client-side routing
5. Base href set to GitHub Pages URL

**Configuration**:
- `angular.json`: Build configuration with production settings
- `environment.ts` / `environment.production.ts`: Environment-specific settings
- `tsconfig.json`: TypeScript compiler options
- `karma.conf.js`: Test runner configuration

### Testing Strategy

- **Unit Tests**: Jasmine specs for services and components (`.spec.ts` files)
- **Test Coverage**: Testing for models (e.g., `current-batters.spec.ts`, `scorecard.spec.ts`)
- **Service Testing**: HTTP service mocking and state management tests
- **Component Testing**: Component behavior and template rendering tests

### Code Quality Standards

As per `.github/copilot-instructions.md`:
- Prettier formatting required before commits
- All unit tests must pass before commits
- Minimal console.log usage
- Angular best practices followed
- Standalone components preferred
- Separate files for styles and templates

### Future Considerations

Based on `ball-by-ball-commentary-planning.md`:
- Enhanced ball-by-ball commentary feature with visual indicators
- Additional wagon wheel features for bowling analysis
- More detailed over-by-over analysis
- Enhanced mobile interactions and gestures

---

## Conclusion

SportsBallPro is a modern, well-architected Angular application that demonstrates best practices in:
- Reactive state management
- API integration and error handling
- Responsive design and mobile-first approach
- Code organization and separation of concerns
- Type safety with TypeScript
- Reusable component architecture

The application successfully provides cricket fans with a comprehensive tool for tracking matches and analyzing player performance, with a focus on South African school cricket.
