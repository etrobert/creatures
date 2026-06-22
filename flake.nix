{
  description = "Nix development shell for the Creatures monorepo";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { nixpkgs, ... }:
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
          npmDepsHash = "sha256-DaEdwJaSwWT1fkUIDyrbJapVAZtcKiOaBB6N6mDOyKQ=";

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

      devShells = forEachSystem (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_24
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
