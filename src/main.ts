import { loadDeployments } from "./util/deploy"

loadDeployments().finally(() => console.log("done"))
