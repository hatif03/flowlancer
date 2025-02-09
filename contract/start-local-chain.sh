#!/bin/bash

if [ -f "anvil_state.json" ]; then
    echo "Loading existing chain state..."
    anvil --load-state anvil_state.json
else
    echo "Starting fresh chain..."
   
    anvil --state anvil_state.json \
          --mnemonic "test test test test test test test test test test test junk" \
          --block-time 12
fi