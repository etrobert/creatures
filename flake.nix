{
  description = "Nix development shell for the Creatures monorepo";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      forEachSystem = f: nixpkgs.lib.genAttrs systems (system: f (import nixpkgs { inherit system; }));
    in
    {
      packages = forEachSystem (pkgs: {
        default = pkgs.buildNpmPackage {
          pname = "creatures";
          version = "1.0.0";
          src = ./.;
          npmDeps = pkgs.importNpmLock { npmRoot = ./.; };
          npmConfigHook = pkgs.importNpmLock.npmConfigHook;

          buildPhase = ''
            npm run build:client
          '';

          installPhase = ''
            mkdir -p $out
            cp -r apps $out/apps
            cp -r packages $out/packages
            cp -r node_modules $out/node_modules

            mkdir -p $out/bin
            makeWrapper ${pkgs.tsx}/bin/tsx $out/bin/creatures-server \
              --set CLIENT_DIST_PATH "$out/apps/client/dist" \
              --add-flags "$out/apps/server/src/index.ts"
          '';
        };
      });

      # Self-contained deployment: runs the server as a systemd unit and exposes
      # it through Caddy. The domain is a consumer option (not hardcoded), so the
      # project isn't bound to any one host. A single `serverPort` feeds both
      # the server's SERVER_PORT and Caddy's reverse-proxy target, so the two
      # can't drift.
      nixosModules.default =
        {
          config,
          lib,
          pkgs,
          ...
        }:
        let
          inherit (pkgs.stdenv.hostPlatform) system;
          cfg = config.services.creatures;
        in
        {
          options.services.creatures = {
            enable = lib.mkEnableOption "the Creatures game server";

            hostName = lib.mkOption {
              type = lib.types.str;
              example = "creatures.example.com";
              description = "Domain Caddy serves Creatures on.";
            };

            serverPort = lib.mkOption {
              type = lib.types.port;
              default = 3000;
              description = ''
                Port the server listens on and that Caddy reverse-proxies to.
              '';
            };
          };

          config = lib.mkIf cfg.enable {
            systemd.services.creatures = {
              description = "Creatures server";
              wantedBy = [ "multi-user.target" ];
              after = [ "network.target" ];
              environment.SERVER_PORT = toString cfg.serverPort;
              serviceConfig = {
                ExecStart = "${self.packages.${system}.default}/bin/creatures-server";
                Restart = "on-failure";
                DynamicUser = true;
              };
            };

            services.caddy = {
              enable = true;
              virtualHosts.${cfg.hostName}.extraConfig = /* caddy */ ''
                reverse_proxy localhost:${toString cfg.serverPort}
              '';
            };
          };
        };

      devShells = forEachSystem (pkgs: {
        # Minimal shell for CI: just the pinned Node toolchain, so the version
        # CI runs is the same one flake.lock pins for the dev shell — no drift
        # against a hardcoded actions/setup-node version. Deliberately excludes
        # Playwright (and its large browser bundle), which the lint/format/
        # typecheck/test jobs don't need.
        ci = pkgs.mkShell {
          packages = [ pkgs.nodejs_26 ];
        };

        default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_26
            playwright-test
          ];

          # Use the NixOS-compatible browsers from nixpkgs instead of letting
          # Playwright download its own (those binaries don't run on NixOS).
          # playwright-test and playwright-driver.browsers resolve from the same
          # pinned nixpkgs, so the CLI and browser revisions stay in sync.
          PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
          PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "1";

          shellHook = /* bash */ ''
            echo "Creatures dev shell ready. Use npm install, npm run dev, or npm run build."
          '';
        };
      });

      formatter = forEachSystem (pkgs: pkgs.nixfmt);
    };
}
